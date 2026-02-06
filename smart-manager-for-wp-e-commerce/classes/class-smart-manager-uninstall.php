<?php
/**
 * Smart Manager Uninstall class.
 *
 * @since       8.74.0
 * @version     8.74.0
 */
defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Smart_Manager_Uninstall' ) ) {
    /**
	 * Class properties and methods will go here.
	 */
    class Smart_Manager_Uninstall {

        /**
		 * Singleton class
		 *
		 * @var object
		*/
        protected static $_instance = null;

        /**
         * Instance of the class
         *
         * @return object
         */
        public static function instance() {
            if ( is_null( self::$_instance ) ) {
                self::$_instance = new self();
            }
            return self::$_instance;
        }

        /**
		 * Constructor is called when the class is instantiated
		 *
		 * @param string $dashboard_key $dashboard_key Current dashboard name.
		 * @return void
		 */
		public function __construct() {
            register_uninstall_hook( SM_PLUGIN_FILE, array( __CLASS__, 'uninstall' ) );
        }

        /**
         * Clean up plugin data on uninstall.
         *
         * @return void
         */
        public static function uninstall() {
            delete_option( 'sa_sm_feedback_start_date' );
            delete_option( 'sa_sm_feedback_action_counts' );
            delete_option( 'sa_sm_feedback_close_date' );
            delete_option( 'sa_sm_dashboard_load_count' );
            delete_option( 'sa_sm_feedback_responses' );
            // delete_option( 'sa_sm_feedback_done' );
	    }

    }
    Smart_Manager_Uninstall::instance();
}
