<?php
/**
 * Smart Manager background updater class.
 *
 * @package common-core/
 * @since       8.77.0
 * @version     8.77.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
if ( ! class_exists( 'Smart_Manager_Background_Updater' ) ) {
    class Smart_Manager_Background_Updater {

		protected static $_instance = null;

		public static function instance( $plugin_data = array() ) {
			if ( is_null( self::$_instance ) ) {
				self::$_instance = new self( $plugin_data );
			}
			return self::$_instance;
		}

        /**
		 * Initiate new background process
		 */
		public function __construct( $plugin_data = array() ) {
            add_filter( 'sa_is_callback_file_includable', function ( $flag = true, $params = array() ) {
				if ( empty( $params['process_key'] ) ) {
					return false;
				}
                if ( ( 'import_wsm_stock_log' === $params['process_key'] ) && ( ! class_exists( 'Smart_Manager_Product_Stock_Log' ) ) && ( file_exists( dirname( __FILE__ ) . '/class-smart-manager-product-stock-log.php' ) ) ) {
					if ( ! class_exists( 'Smart_Manager_Base' ) && ( file_exists( dirname( __FILE__ ) . '/class-smart-manager-base.php' ) ) ) {
						include_once dirname( __FILE__ ) . '/class-smart-manager-base.php';
					}
					if ( ! class_exists( 'Smart_Manager_Task' ) && ( file_exists( dirname( __FILE__ ) . '/class-smart-manager-task.php' ) ) ) {
						include_once dirname( __FILE__ ) . '/class-smart-manager-task.php';
					}
					include_once dirname( __FILE__ ) . '/class-smart-manager-product-stock-log.php';
                }
				return (
					( 'bulk_edit' === $params['process_key'] && ( ! empty( $params['is_common'] ) ) ) ||
					( ( ! in_array( $params['process_key'], array( 'bulk_edit', 'import_wsm_stock_log' ) ) ) && empty( $params['is_common'] ) )
				) ? true : false;
			}, 20, 2 );
			add_filter( 'sa_sm_validate_current_page', array( $this, 'is_valid_page' ) );
			add_action( 'sa_manager_after_background_process_complete', array( __CLASS__, 'after_background_process_complete' ), 10, 2 );
        }

		/**
		 * Checks if the current screen is associated with a valid post type.
		 *
		 * @return bool True if the current screen is associated with a valid post type, otherwise false.
		 */
		public function is_valid_page() {
			return ( ( ( ! empty( $_GET['page'] ) ) && ( 'smart-manager' === sanitize_text_field( wp_unslash( $_GET['page'] ) ) ) ) || ( wp_doing_ajax() ) ) ? true : false;
		}

		/**
		 * Callback function executed after a wsm stock log import process completes.
		 *
		 * @param string $identifier    Unique identifier for the background process.
		 * @param array  $batch_params Parameters associated with the completed batch process.
		 *
		 * @return void
		 */
		public static function after_background_process_complete( $identifier = '', $batch_params = array() ) {
			if ( ( empty( $identifier ) ) || ( empty( $batch_params ) ) || ( ! is_array( $batch_params ) ) || ( empty( $batch_params['process_key'] ) ) || ( 'import_wsm_stock_log' !== $batch_params['process_key'] ) ) {
				return;
			}
			update_option( 'sa_sm_wsm_stock_log_imported', true );
		}

    }
	Smart_Manager_Background_Updater::instance();
}
