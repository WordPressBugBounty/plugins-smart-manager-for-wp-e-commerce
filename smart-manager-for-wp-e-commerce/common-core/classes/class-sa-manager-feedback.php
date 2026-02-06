<?php
/**
 * Common core feedback class.
 *
 * @package common-core/
 * @since       8.74.0
 * @version     8.74.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'SA_Manager_Feedback' ) ) {
	/**
	 * Class properties and methods will go here.
	 */
	class SA_Manager_Feedback {
		/**
		 * Stores the plugin SKU
		 *
		 * @var string
		 */
		public $plugin_sku = '';

		/**
		 * Holds the single instance of the class.
		 *
		 * Ensures only one instance of the class exists.
		 *
		 * @var self|null
		 */
		protected static $instance = null;

		/**
		 * Returns the single instance of the class, creating it if it doesn't exist.
		 *
		 * This method implements the Singleton pattern. It ensures that only one
		 * instance of the class is created, using the provided dashboard key.
		 *
		 * @param string $plugin_data Plugin data.
		 * 
		 * @return self|null self::$instance The single instance of the class
		 */
		public static function instance( $plugin_data = null ) {
			if ( is_null( self::$instance ) && ! empty( $plugin_data ) ) {
				self::$instance = new self( $plugin_data );
			}
			return self::$instance;
		}

		/**
		 * Constructor is called when the class is instantiated
		 *
		 * @param array $plugin_data $plugin_data Current plugin data array.
		 * 
		 * @return void
		 */
		public function __construct( $plugin_data = array() ) {
			$this->plugin_sku    = ( ! empty( $plugin_data['plugin_sku'] ) ) ? $plugin_data['plugin_sku'] : '';
			// Hook: Trigger feedback tracking when dashboard model is saved.
			add_action( $this->plugin_sku . '_dashboard_model_saved', array( $this, 'on_dashboard_model_saved' ) );
			// Hook: Trigger feedback tracking after background process completion.
			add_action( 'sa_manager_background_process_complete', array( $this, 'on_background_process_complete' ) );
		}

		/**
		 * Handle feedback tracking when the dashboard model is saved.
		 *
		 * @return void
		 */
		public function on_dashboard_model_saved() {
			self::handle_feedback_tracking( $this->plugin_sku, 'dashboard_load' );
		}

		/**
		 * Handle feedback tracking after the background process completes.
		 *
		 * @return void
		 */
		public function on_background_process_complete() {
			self::handle_feedback_tracking( $this->plugin_sku, 'bulk_edit' );
		}

		/**
		 * Initialize feedback start date tracking
		 * 
		 * @param string $plugin_sku Plugin SKU identifier
		 * @param bool $is_dashboard_load Whether this is triggered on dashboard load
		 * 
		 * @return void
		 */
		public static function handle_feedback_tracking( $plugin_sku = '', $action_type = '' ) {
			if ( empty( $plugin_sku ) || empty( $action_type ) ) {
				return;
			}
			// Stop immediately if user has already left a review.
			if ( get_option( 'sa_' . $plugin_sku . '_feedback_done', false ) ) {
				return;
			}
			$feedback_start_date_option_key = 'sa_' . $plugin_sku . '_feedback_start_date';
			$feedback_start_date = get_option( $feedback_start_date_option_key, false );
			// If start date already exists, track actions if applicable.
			if ( ! empty( $feedback_start_date ) ) {
				self::maybe_track_action_counts( array( 'plugin_sku' => $plugin_sku, 'feedback_start_date' => $feedback_start_date, 'action_type' => $action_type ) );
				return;
			}
			// Handle dashboard load counting logic.
			if ( 'dashboard_load' === $action_type ) {
				$dashboard_load_count_option_key = 'sa_' . $plugin_sku . '_dashboard_load_count';
				$load_count = absint( get_option( $dashboard_load_count_option_key, 0 ) );
				if ( 0 === $load_count ) {
					update_option( $dashboard_load_count_option_key, 1, 'no' );
					return;
				}
				// On second load, set the start date and clean up counter.
				delete_option( $dashboard_load_count_option_key );
			}
			// Set the feedback start date.
			update_option( $feedback_start_date_option_key, gmdate( 'Y-m-d', sa_get_offset_timestamp() ), 'no' );
		}

		/**
		 * Track action counts for a specific plugin if 15 days have passed since the feedback start date.
		 *
		 * @param array $args {
		 *     Optional. Array of arguments.
		 *
		 *     @type string $plugin_sku         Unique plugin SKU identifier.
		 *     @type string $feedback_start_date Feedback start date.
		 *     @type string $action_type        The action type to track (e.g., 'review', 'skip', etc.).
		 * }
		 * @return void
		 */
		public static function maybe_track_action_counts( $args = array() ) {
			if ( empty( $args ) || ! is_array( $args ) || empty( $args['plugin_sku'] ) || empty( $args['feedback_start_date'] ) || empty( $args['action_type'] ) ) {
				return;
			}
			// Ensure 15 days have passed before tracking.
			if ( ( absint( self::get_days_elapsed( $args['feedback_start_date'] ) ) ) < 15 ) {
				return;
			}
			// Retrieve existing action counts or initialize empty.
			$action_counts_option_key = 'sa_' . $args['plugin_sku'] . '_feedback_action_counts';
			$default_counts = array( 'inline_edit' => 0, 'bulk_edit' => 0, 'advanced_search' => 0 );
			$action_counts  = get_option( $action_counts_option_key, $default_counts );
			if ( ! is_array( $action_counts ) ) {
				$action_counts = $default_counts;
			}
			$action_counts[ $args['action_type'] ] = ( ! empty( $action_counts[ $args['action_type'] ] ) ? ( ( (int) $action_counts[ $args['action_type'] ] ) + 1 ) : 1 );
			// Update the option with the new count values.
			update_option( $action_counts_option_key, $action_counts, false );
		}

		/**
		 * Determine if feedback should be shown based on criteria
		 * 
		 * @param string $plugin_sku Plugin SKU identifier
		 * 
		 * @return bool True if feedback should be shown, false otherwise
		 */
		public static function show_feedback( $plugin_sku = '' ) {
			if ( empty( $plugin_sku ) ) {
				return false;
			}
			// Stop immediately if user has already left a review.
			if ( get_option( 'sa_' . $plugin_sku . '_feedback_done', false ) ) {
				return false;
			}
			$start_date = get_option( 'sa_' . $plugin_sku . '_feedback_start_date', false );
			if ( empty( $start_date ) ) {
				return false;
			}
			$close_date = get_option( 'sa_' . $plugin_sku . '_feedback_close_date', false );
			
			// If feedback was closed, check if 20 days have passed.
			if ( ! empty( $close_date ) ) {
				// After 20 days, show feedback again if any action has been performed at least once.
				return ( ( absint( self::get_days_elapsed( $close_date ) ) < 20 ) ? false : true );
			}
			// First-time feedback: Check if 15 days have passed since start.
			if ( absint( self::get_days_elapsed( $start_date ) ) < 15 ) {
				return false;
			}
			// Show feedback if any threshold is met.
			$action_counts = get_option( 'sa_' . $plugin_sku . '_feedback_action_counts', array( 'inline_edit' => 0, 'bulk_edit' => 0, 'advanced_search' => 0 ) );
			if ( ( self::has_action_reached_threshold( $plugin_sku, 2, $action_counts, 'inline_edit' ) ) || ( self::has_action_reached_threshold( $plugin_sku, 1, $action_counts, 'bulk_edit' ) ) || ( self::has_action_reached_threshold( $plugin_sku, 3, $action_counts, 'advanced_search' ) ) ) {
				return true;
			}
			return false;
		}

		/**
		 * Check if any or a specific action has been performed at least the given threshold.
		 *
		 * @param string $plugin_sku   Plugin SKU identifier.
		 * @param int    $min_threshold Optional. Minimum count threshold. Default 1.
		 * @param array  $action_counts array of actions with there counts.
		 * @param string $action_type   Optional. Specific action type to check (e.g., 'review', 'skip'). Default empty to check all.
		 * 
		 * @return bool True if the action(s) meet(s) the threshold, false otherwise.
		 */
		private static function has_action_reached_threshold( $plugin_sku, $min_threshold = 1, $action_counts, $action_type = '' ) {
			if ( empty( $plugin_sku ) || empty( $action_counts ) || ! is_array( $action_counts ) ) {
				return false;
			}
			// If specific action type is provided, check only that.
			if ( ! empty( $action_type ) ) {
				return ( ! empty( $action_counts[ $action_type ] ) && ( (int) $action_counts[ $action_type ] >= (int) $min_threshold ) );
			}
			// Otherwise, check if any action meets or exceeds the threshold.
			foreach ( $action_counts as $action => $count ) {
				if ( (int) $count >= (int) $min_threshold ) {
					return true;
				}
			}
			return false;
		}

		/**
		 * Calculate days elapsed since a given date
		 * 
		 * @param string $date_string Date in 'Y-m-d' format
		 * 
		 * @return int Number of days elapsed
		 */
		private static function get_days_elapsed( $date_string = '' ) {
			if ( empty( $date_string ) ) {
				return;
			}
			return floor( ( ( sa_get_offset_timestamp() ) - ( strtotime( $date_string ) ) ) / DAY_IN_SECONDS );
		}

		/**
		 * Method to update feedback-related options based on user action.
		 * 
		 * @param array $args Array of data required to update feedback
		 * @return void
		 */
		public static function update_feedback( $args = array() ) {
			if ( ( empty( $args ) ) || ( ! is_array( $args ) ) || ( empty( $args['plugin_sku'] ) ) || ( empty( $args['update_action'] ) ) ) {
				return;
			}
			if ( in_array( $args['update_action'], array( 'positive', 'negative' ), true ) ) {
				$feedback_responses = get_option(
					'sa_' . $args['plugin_sku'] . '_feedback_responses',
					array(
						'positive' => array(),
						'negative' => array(),
					)
				);
				// Append current timestamp to appropriate response type.
				$feedback_responses[ $args['update_action'] ][] = gmdate( 'U' );
				update_option( 'sa_' . $args['plugin_sku'] . '_feedback_responses', $feedback_responses, 'no' );
			} if ( 'close' === $args['update_action'] ) {
				update_option( 'sa_' . $args['plugin_sku'] . '_feedback_close_date', gmdate( 'Y-m-d', sa_get_offset_timestamp() ), 'no' );
				delete_option( 'sa_' . $args['plugin_sku'] . '_feedback_action_counts' );
			} elseif ( 'review' === $args['update_action'] ) {
				update_option( 'sa_' . $args['plugin_sku'] . '_feedback_done', true, 'no' );
				delete_option( 'sa_' . $args['plugin_sku'] . '_feedback_action_counts' );
			}
		}
	}
}
