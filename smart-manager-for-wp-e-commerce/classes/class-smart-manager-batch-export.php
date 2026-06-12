<?php
/**
 * Smart Manager Batch Export handler class.
 *
 * Handles background processing of large CSV exports using existing SA_Manager_Background_Updater.
 * Follows the implementation plan: reuses send_to_background_process(), batch_process(), 
 * calculate_background_process_progress(), background_process_notice(), etc.
 *
 * @package Smart_Manager/Classes
 * @since   8.89.0
 * @version 1.1.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'Smart_Manager_Batch_Export' ) ) {

	/**
	 * Smart Manager Batch Export Class.
	 */
	class Smart_Manager_Batch_Export {

		/**
		 * Singleton instance.
		 *
		 * @var Smart_Manager_Batch_Export|null
		 */
		protected static $_instance = null;

		/**
		 * Upload directory for exports (uses defined exports for consistency).
		 *
		 * @var string
		 */
		public static $export_dir = 'sa_sm_exports';

		/**
		 * Meta key to identify batch export attachments.
		 *
		 * @var string
		 */
		public static $attachment_meta_key = 'sa_sm_is_batch_export_file';

		/**
		 * Returns singleton instance.
		 *
		 * @return Smart_Manager_Batch_Export
		 */
		public static function instance() {
			if ( is_null( self::$_instance ) ) {
				self::$_instance = new self();
			}
			return self::$_instance;
		}

		/**
		 * Constructor.
		 */
		public function __construct() {
			// Add hook for export completion.
			add_action( 'sa_manager_after_background_process_complete', array( $this, 'on_export_complete' ), 10, 2 );

			// Add hook for batch export CSV cleanup.
			add_action( 'sm_batch_export_csv_cleanup', array( $this, 'cleanup_old_csv_files' ) );

			// Add AJAX handler for secure file download.
			add_action( 'wp_ajax_sa_sm_export_file_download', array( $this, 'handle_export_file_download' ) );
		}

		/**
		 * Get upload directory for exports.
		 * Uses defined exports directory for consistency with scheduled exports.
		 *
		 * @return array|false Array with path, url, basedir, baseurl, or false on failure.
		 */
		public static function get_export_upload_dir() {
			$upload_dir = wp_upload_dir();
			if ( empty( $upload_dir['basedir'] ) ) {
				return false;
			}

			$export_path = trailingslashit( $upload_dir['basedir'] ) . self::$export_dir;
			$export_url  = trailingslashit( $upload_dir['baseurl'] ) . self::$export_dir;

			if ( ! file_exists( $export_path ) ) {
				if ( false === wp_mkdir_p( $export_path ) ) {
					return false;
				}
			}

			return array(
				'path'    => $export_path,
				'url'     => $export_url,
				'basedir' => $upload_dir['basedir'],
				'baseurl' => $upload_dir['baseurl'],
			);
		}

		/**
		 * Create a WordPress attachment for the CSV file.
		 * This makes the file visible in Media Library and provides a clean download URL.
		 *
		 * @param string $file_path Full path to the CSV file.
		 * @param string $file_name CSV file name.
		 * @return int|false Attachment ID on success, false on failure.
		 */
		public static function create_csv_attachment( $file_path, $file_name ) {
			if ( empty( $file_path ) || empty( $file_name ) ) {
				return false;
			}

			$upload_dir = self::get_export_upload_dir();
			if ( ! $upload_dir ) {
				return false;
			}

			$filetype = wp_check_filetype( $file_name, null );
			if ( empty( $filetype ) || ! is_array( $filetype ) || empty( $filetype['type'] ) ) {
				return false;
			}

			$attachment_id = wp_insert_attachment(
				array(
					'guid'           => trailingslashit( $upload_dir['url'] ) . $file_name,
					'post_mime_type' => $filetype['type'],
					'post_title'     => $file_name,
					'post_status'    => 'inherit',
				),
				$file_path
			);

			if ( empty( $attachment_id ) || is_wp_error( $attachment_id ) ) {
				return false;
			}

			// Mark attachment as a batch export file for cleanup.
			update_post_meta( $attachment_id, self::$attachment_meta_key, true );

			return $attachment_id;
		}

		/**
		 * Initiate batch export - entry point called from get_export_csv().
		 * Uses SA_Manager_Background_Updater directly (same pattern as initiate_wsm_stock_log_import_process).
		 *
		 * @param array $params Export parameters from get_export_csv().
		 * @return bool True if batch export started, false for direct export.
		 */
		public static function initiate_batch_export_process( $params = array() ) {
			// Validate required classes and methods
			if ( empty( $params ) || ! is_array( $params ) || empty( $params['csv_file_name'] ) || ( ! class_exists( 'SA_Manager_Background_Updater' ) ) || ( ! is_callable( array( 'SA_Manager_Background_Updater', 'instance' ) ) ) || ( ! is_callable( array( 'SA_Manager_Background_Updater', 'get_identifier' ) ) ) ) {
				return false;
			}
            // Get identifier from background updater
			$identifier = SA_Manager_Background_Updater::get_identifier();
			if ( empty( $identifier ) ) {
				return false;
			}
            update_option( $identifier . '_initial_process', 1, 'no' );
            if ( ! empty( $params['storewide_option'] ) ) {
                $params['selected_ids'] = apply_filters( 'sa_sm_get_entire_store_ids', $params['selected_ids'], $params );
            }
            if ( empty( $params['selected_ids'] ) ) {
                return false;
            }
			

			// Prepare export file directory
			$upload_dir = self::get_export_upload_dir();
			if ( ! $upload_dir ) {
				return false;
			}

			$selected_ids = $params['selected_ids'];
			$total_count = is_array( $selected_ids ) ? count( $selected_ids ) : 0;
			$dashboard_key = ! empty( $params['active_module'] ) ? sanitize_key( $params['active_module'] ) : '';
            if ( empty( $dashboard_key ) || empty( $total_count ) ) {
                return false;
            }
			$csv_file_name = $params['csv_file_name'];
			$csv_file_path = trailingslashit( $upload_dir['path'] ) . $csv_file_name;

			// Build params for background process (following initiate_wsm_stock_log_import_process pattern)
			$export_params = $params;
			$export_params['process_key']                      = 'export_csv';
			$export_params['process_name']                     = _x( 'Export CSV', 'background process name', 'smart-manager-for-wp-e-commerce' );
			$export_params['class_nm']                         = 'Smart_Manager_Batch_Export';
			$export_params['class_path']                       = 'class-smart-manager-batch-export.php';
			$export_params['callback']['func']                 = array( 'Smart_Manager_Batch_Export', 'process_batch' );
			$export_params['callback']['class_path']           = $export_params['class_path'];
			$export_params['id_count']                         = count( $selected_ids );
			$export_params['dashboard_key']                    = $dashboard_key;
			$export_params['active_dashboard']                 = $export_params['dashboard_title'];
			$export_params['plugin_data']                      = get_sa_manager_common_params();
			$export_params['backgroundProcessRunningMessage']  = _x( 'You can continue working. The CSV will automatically download when the process is complete. A download link will also be sent to your email.', 'background process message', 'smart-manager-for-wp-e-commerce' );
			// Export-specific params
			$export_params['csv_file_path']                    = $csv_file_path;
			$export_params['csv_file_name']                    = $csv_file_name;
			$export_params['csv_download_url']                 = self::get_download_url( self::create_csv_attachment( $csv_file_path, $csv_file_name ) );
			$export_params['user_email']                       = wp_get_current_user()->user_email;

			update_option( $identifier . '_params', $export_params, 'no' );
			update_option( $identifier . '_ids', $selected_ids, 'no' ); // Actual IDs for progress tracking
			
			// Track current offset for pagination-based data fetching (maintains sort order)
			update_option( $identifier . '_export_offset', 0, 'no' );

			// Initiate the batch process
			if ( is_callable( array( SA_Manager_Background_Updater::instance(), 'initiate_batch_process' ) ) ) {
				SA_Manager_Background_Updater::instance()->initiate_batch_process( $selected_ids );
			}
		}

		/**
		 * Process a batch of records - callback for batch_process().
		 * Uses limit/offset pagination to maintain sort order.
		 * The background updater passes dynamic batch of IDs - we use count as limit and tracked offset.
		 *
		 * @param array $args Batch args with selected_ids and batch_params.
		 */
		public static function process_batch( $args = array() ) {
			if ( empty( $args ) || ! is_array( $args ) || empty( $args['batch_params'] ) || empty( $args['selected_ids'] ) || empty( $args['batch_params']['dashboard_key'] ) ) {
				return;
			}

			$batch_params = $args['batch_params'];
			$batch_ids = $args['selected_ids']; // IDs passed by background updater (dynamic batch size)
			$dashboard_key = $batch_params['dashboard_key'];
			
			// The number of IDs passed = dynamic batch size determined by background updater
			$dynamic_limit = is_array( $batch_ids ) ? count( $batch_ids ) : 0;
			if ( empty( $dynamic_limit ) ) {
				return;
			}

			// Get current offset for pagination (maintains sort order)
			$identifier = '';
			if ( class_exists( 'SA_Manager_Background_Updater' ) && is_callable( array( 'SA_Manager_Background_Updater', 'get_identifier' ) ) ) {
				$identifier = SA_Manager_Background_Updater::get_identifier();
			}
			$current_offset = ! empty( $identifier ) ? intval( get_option( $identifier . '_export_offset', 0 ) ) : 0;

			// Get dashboard class instance
			$class_name = self::get_dashboard_class( $dashboard_key );
			if ( ! class_exists( $class_name ) ) {
				self::include_dashboard_class( $dashboard_key );
			}
			if ( ! class_exists( $class_name ) || ! is_callable( array( $class_name, 'instance' ) ) ) {
				return;
			}

			$instance = $class_name::instance( $dashboard_key );

			// Set up req_params with limit/offset for pagination
			$instance->req_params = $batch_params;
			$instance->req_params['cmd'] = 'get_export_csv';
			$instance->req_params['use_batch_export'] = true;
			$instance->req_params['active_module'] = $dashboard_key;
			$instance->req_params['sm_limit'] = $dynamic_limit; // Use dynamic batch size as limit
			$instance->req_params['start'] = $current_offset; // Use tracked offset
			$instance->req_params['sm_page'] = 1; // Reset page since we're using start offset directly
			$instance->req_params['storewide_option'] = ''; // Clear to prevent -1 limit
			$instance->req_params['selected_ids'] = ''; // Clear to prevent ID filtering - use limit/offset instead

			// Get data using get_data_model with limit/offset (maintains sort order)
			$data = $instance->get_data_model( $batch_params['col_model'] );
			
			// Update offset for next batch
			update_option( $identifier . '_export_offset', $current_offset + $dynamic_limit, 'no' );

			if ( ( empty( $data ) ) || ( ! is_array( $data ) ) || ( empty( $data['items'] ) ) || ( ! is_array( $data['items'] ) ) ) {
				return;
			}

			// Format and write CSV
			self::write_csv_batch( $batch_params, $data['items'], $batch_params['csv_columns'] );
		}

		/**
		 * Write batch data to CSV file.
		 *
		 * @param array $params    Batch params with csv_file_path.
		 * @param array $items     Data items.
		 * @param array $csv_columns CSV Columns.
		 */
		private static function write_csv_batch( $params, $items, $csv_columns ) {
			$file_path = $params['csv_file_path'];
			$is_first  = ! file_exists( $file_path );

			$handle = fopen( $file_path, 'a' );
			if ( ! $handle ) {
				return;
			}

			// Use common function to parse column model
			$headers     = $csv_columns['headers'];
			$fields      = $csv_columns['fields'];
			$select_cols = $csv_columns['select_cols'];
			$numeric_cols = $csv_columns['numeric_cols'];

			// Write headers on first batch
			if ( $is_first ) {
				fwrite( $handle, implode( ',', array_values( $headers ) ) . "\n" );
			}

			// Write rows using common formatting function
			foreach ( $items as $row ) {
				$row_string = sa_sm_format_csv_row( $row, $fields, $select_cols, $numeric_cols );
				fwrite( $handle, $row_string . "\n" );
			}
			fclose( $handle );
		}

		/**
		 * Generate download URL for export file using attachment URL.
		 *
		 * @param int $attachment_id Attachment ID.
		 * @return string|false Download URL or false on failure.
		 */
		public static function get_download_url( $attachment_id ) {
			if ( empty( $attachment_id ) ) {
				return false;
			}

			return add_query_arg(
				array(
					'action' => 'sa_sm_export_file_download',
					'id'     => $attachment_id,
				),
				admin_url( 'admin-ajax.php' )
			);
		}

		/**
		 * Handle secure file download via AJAX.
		 * Validates token and streams file using WooCommerce's download method.
		 */
		public function handle_export_file_download() {
			$attachment_id = ! empty( $_GET['id'] ) ? absint( wp_unslash( $_GET['id'] ) ) : 0;

			if ( empty( $attachment_id ) ) {
				wp_die( esc_html__( 'Invalid download link.', 'smart-manager-for-wp-e-commerce' ), '', array( 'response' => 403 ) );
			}

			// Verify it's a batch export file.
			if ( empty( get_post_meta( $attachment_id, self::$attachment_meta_key, true ) ) ) {
				wp_die( esc_html__( 'Invalid export file.', 'smart-manager-for-wp-e-commerce' ), '', array( 'response' => 404 ) );
			}

			// Get file path.
			$file_path = get_attached_file( $attachment_id );
			if ( empty( $file_path ) || ! file_exists( $file_path ) ) {
				wp_die( esc_html__( 'File not found.', 'smart-manager-for-wp-e-commerce' ), '', array( 'response' => 404 ) );
			}

			//Downlaod CSV.
			self::download_export_file( $file_path, basename( $file_path ) );
			exit;
		}

		/**
		 * Handle export completion - create attachment and send email with download link.
		 *
		 * @param string $identifier Background process identifier.
		 * @param array  $batch_params Batch parameters.
		 */
		public function on_export_complete( $identifier = '', $batch_params = array() ) {
			if ( ( ! is_array( $batch_params ) ) || ( empty( $batch_params['process_key'] ) ) || ( 'export_csv' !== $batch_params['process_key'] ) || ( empty( $batch_params['csv_download_url'] ) ) || ( empty( $batch_params['csv_file_name'] ) ) ) {
				return;
			}

			// Clean up offset tracking option.
			if ( ! empty( $identifier ) ) {
				delete_option( $identifier . '_export_offset' );
			}

			$download_url = $batch_params['csv_download_url'];
			if ( empty( $download_url ) ) {
				sa_manager_log( 'error', _x( 'Batch Export: Failed to get attachment URL.', 'batch export error', 'smart-manager-for-wp-e-commerce' ) );
				return;
			}

			// Skip email if no user email provided.
			if ( empty( $batch_params['user_email'] ) ) {
				return;
			}

			$site_name = get_bloginfo( 'name' );
			$dashboard_name = ! empty( $batch_params['active_dashboard'] ) ? $batch_params['active_dashboard'] : 'Records';
			$record_count = ! empty( $batch_params['id_count'] ) ? $batch_params['id_count'] : 0;

			// Build HTML email
			$subject = sprintf( 
				/* translators: %s: site name */
				__( 'Your CSV Export from %s is Ready', 'smart-manager-for-wp-e-commerce' ), 
				$site_name 
			);

			$message = self::get_export_email_html( array(
				'site_name'      => $site_name,
				'dashboard_name' => $dashboard_name,
				'record_count'   => $record_count,
				'download_url'   => $download_url,
				'file_name'      => $batch_params['csv_file_name'],
			) );

			// Send email
			if ( class_exists( 'SA_Manager_Base' ) && is_callable( array( 'SA_Manager_Base', 'send_email' ) ) ) {
				SA_Manager_Base::send_email( array(
					'email'   => $batch_params['user_email'],
					'subject' => $subject,
					'message' => $message,
					'headers' => array( 'Content-Type: text/html; charset=UTF-8' ),
				) );
			} 
		}

		/**
		 * Get HTML email content for export completion.
		 *
		 * @param array $args Email arguments.
		 * @return string HTML email content.
		 */
		private static function get_export_email_html( $args = array() ) {
			$site_name      = ! empty( $args['site_name'] ) ? $args['site_name'] : get_bloginfo( 'name' );
			$dashboard_name = ! empty( $args['dashboard_name'] ) ? $args['dashboard_name'] : 'Records';
			$record_count   = ! empty( $args['record_count'] ) ? absint( $args['record_count'] ) : 0;
			$download_url   = ! empty( $args['download_url'] ) ? $args['download_url'] : '';
			$file_name      = ! empty( $args['file_name'] ) ? $args['file_name'] : 'export.csv';

			ob_start();
			include SM_PLUGIN_DIR_PATH . '/templates/emails/batch-export.php';
			return ob_get_clean();
		}

		/**
		 * Schedule the batch export CSV cleanup action.
		 * Runs daily to delete CSV files older than 7 days.
		 *
		 * @return void
		 */
		public static function schedule_batch_export_cleanup() {
			if ( ! function_exists( 'as_schedule_recurring_action' ) || ! function_exists( 'as_next_scheduled_action' ) ) {
				return;
			}
			if ( as_next_scheduled_action( 'sm_batch_export_csv_cleanup' ) ) {
				return;
			}
			// Schedule to run daily, starting tomorrow.
			$timestamp = strtotime( 'tomorrow midnight' );
			as_schedule_recurring_action( $timestamp, DAY_IN_SECONDS, 'sm_batch_export_csv_cleanup' );
		}

		/**
		 * Cleanup old batch export CSV attachments.
		 * Deletes attachments older than configured days (default 7).
		 * Uses wp_delete_attachment() which also removes the physical file.
		 *
		 * @return void
		 */
		public function cleanup_old_csv_files() {
			global $wpdb;

			$expiration_days = apply_filters( 'sm_batch_export_file_expiration_days', absint( get_option( 'sm_batch_export_file_expiration_days', 7 ) ) );
			if ( absint( $expiration_days ) ) {
				return;
			}

			// Calculate expiration date.
			$expiration_date = gmdate( 'Y-m-d', time() - ( $expiration_days * DAY_IN_SECONDS ) ) . ' 00:00:00';

			// Get expired batch export attachment IDs.
			$attachment_ids = $wpdb->get_col(
				$wpdb->prepare(
					"SELECT p.ID 
					FROM {$wpdb->postmeta} pm 
					JOIN {$wpdb->posts} p ON p.ID = pm.post_id 
					WHERE pm.meta_key = %s 
					  AND pm.meta_value = %s 
					  AND p.post_type = %s 
					  AND p.post_date < %s",
					self::$attachment_meta_key,
					'1',
					'attachment',
					'inherit',
					$expiration_date
				)
			);

			if ( is_wp_error( $attachment_ids ) || empty( $attachment_ids ) || ! is_array( $attachment_ids ) ) {
				return;
			}

			// Delete each attachment permanently (also removes the file).
			foreach ( $attachment_ids as $attachment_id ) {
				if ( empty( $attachment_id ) ) {
					continue;
				}
				wp_delete_attachment( (int) $attachment_id, true );
			}
		}

		/**
		 * Get dashboard class name.
		 *
		 * @param string $dashboard_key Dashboard key.
		 * @return string
		 */
		private static function get_dashboard_class( $dashboard_key = '' ) {
			if ( empty( $dashboard_key ) ) {
				return;
			}
			$suffix = str_replace( ' ', '_', ucwords( str_replace( array( '-', '_' ), ' ', $dashboard_key ) ) );
			$pro = 'Smart_Manager_Pro_' . $suffix;
			return ( defined( 'SMPRO' ) && SMPRO && class_exists( $pro ) ) ? $pro : 'Smart_Manager_' . $suffix;
		}

		/**
		 * Include dashboard class file.
		 *
		 * @param string $dashboard_key Dashboard key.
		 */
		private static function include_dashboard_class( $dashboard_key = '' ) {
			if ( empty( $dashboard_key ) ) {
				return;
			}
			$file = str_replace( '_', '-', $dashboard_key );
			if ( defined( 'SM_PLUGIN_DIR_PATH' ) ) {
				$pro_file = SM_PLUGIN_DIR_PATH . '/pro/classes/class-smart-manager-pro-' . $file . '.php';
				$base_file = SM_PLUGIN_DIR_PATH . '/classes/class-smart-manager-' . $file . '.php';
				if ( defined( 'SMPRO' ) && SMPRO && file_exists( $pro_file ) ) {
					include_once $pro_file;
				} elseif ( file_exists( $base_file ) ) {
					include_once $base_file;
				}
			}
		}

		/**
		 * Force download file (fallback if WooCommerce not available).
		 * Based on WC_Download_Handler::download_file_force() pattern.
		 *
		 * @param string $file_path Full path to file.
		 * @param string $filename  Filename for download.
		 */
		private static function download_export_file( $file_path = '', $filename = '' ) {
			if ( ( empty( $file_path ) ) || ( empty( $filename ) ) || ( ! file_exists( $file_path ) ) ) {
				wp_die( esc_html__( 'File not found', 'smart-manager-for-wp-e-commerce' ), '', array( 'response' => 404 ) );
			}
			$file_size      = @filesize( $file_path ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			$download_range = self::get_download_range( $file_size );

			self::download_headers( $file_path, $filename, $download_range );

			$start  = isset( $download_range['start'] ) ? $download_range['start'] : 0;
			$length = isset( $download_range['length'] ) ? $download_range['length'] : 0;

			if ( ! self::readfile_chunked( $file_path, $start, $length ) ) {
				wp_die( esc_html__( 'File not found', 'smart-manager-for-wp-e-commerce' ), '', array( 'response' => 404 ) );
			}

			exit;
		}

		/**
		 * Parse the HTTP_RANGE request from iOS devices.
		 * Does not support multi-range requests.
		 *
		 * @param int $file_size Size of file in bytes.
		 * @return array Range download info.
		 */
		private static function get_download_range( $file_size = 0 ) {
			$start          = 0;
			$download_range = array(
				'start'            => $start,
				'is_range_valid'   => false,
				'is_range_request' => false,
			);

			if ( ! $file_size ) {
				return $download_range;
			}

			$end                      = $file_size - 1;
			$download_range['length'] = $file_size;

			if ( isset( $_SERVER['HTTP_RANGE'] ) ) { // phpcs:ignore WordPress.Security.ValidatedSanitizedInput
				$http_range                         = sanitize_text_field( wp_unslash( $_SERVER['HTTP_RANGE'] ) );
				$download_range['is_range_request'] = true;

				$c_start = $start;
				$c_end   = $end;

				// Extract the range string.
				list( , $range ) = explode( '=', $http_range, 2 );

				// Make sure the client hasn't sent us a multibyte range.
				if ( strpos( $range, ',' ) !== false ) {
					return $download_range;
				}

				if ( '-' === $range[0] ) {
					// The n-number of the last bytes is requested.
					$c_start = $file_size - substr( $range, 1 );
				} else {
					$range   = explode( '-', $range );
					$c_start = ( isset( $range[0] ) && is_numeric( $range[0] ) ) ? (int) $range[0] : 0;
					$c_end   = ( isset( $range[1] ) && is_numeric( $range[1] ) ) ? (int) $range[1] : $file_size;
				}

				// End bytes can not be larger than $end.
				$c_end = ( $c_end > $end ) ? $end : $c_end;

				// Validate the requested range.
				if ( $c_start > $c_end || $c_start > $file_size - 1 || $c_end >= $file_size ) {
					return $download_range;
				}

				$start  = $c_start;
				$end    = $c_end;
				$length = $end - $start + 1;

				$download_range['start']          = $start;
				$download_range['length']         = $length;
				$download_range['is_range_valid'] = true;
			}

			return $download_range;
		}

		/**
		 * Set headers for the download.
		 *
		 * @param string $file_path      File path.
		 * @param string $filename       File name.
		 * @param array  $download_range Array containing info about range download request.
		 */
		private static function download_headers( $file_path = '', $filename = '', $download_range = array() ) {
			if ( ( empty( $file_path ) ) || ( empty( $filename ) ) || ( ! is_array( $download_range ) ) ) {
				return;
			}
			self::check_server_config();
			self::clean_buffers();

			nocache_headers();

			header( 'X-Robots-Tag: noindex, nofollow', true );
			header( 'Content-Type: text/csv; charset=UTF-8' );
			header( 'Content-Description: File Transfer' );
			header( 'Content-Disposition: attachment; filename="' . sanitize_file_name( $filename ) . '";' );
			header( 'Content-Transfer-Encoding: binary' );

			$file_size = @filesize( $file_path ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			if ( ! $file_size ) {
				return;
			}

			if ( isset( $download_range['is_range_request'] ) && true === $download_range['is_range_request'] ) {
				if ( false === $download_range['is_range_valid'] ) {
					header( 'HTTP/1.1 416 Requested Range Not Satisfiable' );
					header( 'Content-Range: bytes 0-' . ( $file_size - 1 ) . '/' . $file_size );
					exit;
				}

				$start  = $download_range['start'];
				$end    = $download_range['start'] + $download_range['length'] - 1;
				$length = $download_range['length'];

				header( 'HTTP/1.1 206 Partial Content' );
				header( "Accept-Ranges: 0-$file_size" );
				header( "Content-Range: bytes $start-$end/$file_size" );
				header( "Content-Length: $length" );
			} else {
				header( 'Content-Length: ' . $file_size );
			}
		}

		/**
		 * Check and set certain server config variables to ensure downloads work as intended.
		 */
		private static function check_server_config() {
			if ( function_exists( 'wc_set_time_limit' ) ) {
				wc_set_time_limit( 0 );
			} elseif ( function_exists( 'set_time_limit' ) ) {
				@set_time_limit( 0 ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			}

			if ( function_exists( 'apache_setenv' ) ) {
				@apache_setenv( 'no-gzip', 1 ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged, WordPress.PHP.DiscouragedPHPFunctions.runtime_configuration_apache_setenv
			}

			@ini_set( 'zlib.output_compression', 'Off' ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged, WordPress.PHP.DiscouragedPHPFunctions.runtime_configuration_ini_set
			@session_write_close(); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
		}

		/**
		 * Clean all output buffers.
		 * Can prevent errors, for example: transfer closed with 3 bytes remaining to read.
		 */
		private static function clean_buffers() {
			if ( ob_get_level() ) {
				$levels = ob_get_level();
				for ( $i = 0; $i < $levels; $i++ ) {
					@ob_end_clean(); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
				}
			} else {
				@ob_end_clean(); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			}
		}

		/**
		 * Read file chunked.
		 * Reads file in chunks so big downloads are possible without changing PHP.INI.
		 *
		 * @param  string $file   File.
		 * @param  int    $start  Byte offset/position of the beginning from which to read from the file.
		 * @param  int    $length Length of the chunk to be read from the file in bytes, 0 means full file.
		 * @return bool Success or fail.
		 */
		private static function readfile_chunked( $file = '', $start = 0, $length = 0 ) {
			if ( empty( $file ) ) {
				return false;
			}
			$chunk_size = 1024 * 1024; // 1MB chunks.

			$handle = @fopen( $file, 'r' ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged, WordPress.WP.AlternativeFunctions.file_system_read_fopen

			if ( false === $handle ) {
				return false;
			}

			if ( ! $length ) {
				$length = @filesize( $file ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			}

			$read_length = (int) $chunk_size;

			if ( $length ) {
				$end = $start + $length - 1;

				@fseek( $handle, $start ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
				$p = @ftell( $handle ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged

				while ( ! @feof( $handle ) && $p <= $end ) { // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
					// Don't run past the end of file.
					if ( $p + $read_length > $end ) {
						$read_length = $end - $p + 1;
					}

					echo @fread( $handle, $read_length ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged, WordPress.Security.EscapeOutput.OutputNotEscaped, WordPress.WP.AlternativeFunctions.file_system_read_fread
					$p = @ftell( $handle ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged

					if ( ob_get_length() ) {
						ob_flush();
						flush();
					}
				}
			} else {
				while ( ! @feof( $handle ) ) { // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
					echo @fread( $handle, $read_length ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged, WordPress.Security.EscapeOutput.OutputNotEscaped, WordPress.WP.AlternativeFunctions.file_system_read_fread
					if ( ob_get_length() ) {
						ob_flush();
						flush();
					}
				}
			}

			return @fclose( $handle ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged, WordPress.WP.AlternativeFunctions.file_system_read_fclose
		}
	}

	Smart_Manager_Batch_Export::instance();
}
