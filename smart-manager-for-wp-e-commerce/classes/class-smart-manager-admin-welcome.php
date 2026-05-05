<?php
/**
 * Welcome Page Class
*/

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * SM_Admin_Welcome class
 */
class Smart_Manager_Admin_Welcome {

	/**
	 * Hook in tabs.
	 */
	public $sm_redirect_url, $plugin_url;

	static $text_domain, $prefix, $sku, $plugin_file;

	public function __construct() {

		$this->sm_redirect_url = admin_url( 'admin.php?page=smart-manager' );

		self::$text_domain = (defined('SM_TEXT_DOMAIN')) ? SM_TEXT_DOMAIN : 'smart-manager-for-wp-e-commerce';
		self::$prefix = (defined('SM_PREFIX')) ? SM_PREFIX : 'sa_smart_manager';
		self::$sku = (defined('SM_SKU')) ? SM_SKU : 'sm';
		self::$plugin_file = (defined('SM_PLUGIN_FILE')) ? SM_PLUGIN_FILE : '';

		add_action( 'admin_head', array( $this, 'admin_head' ) );
		add_action( 'admin_init', array( $this, 'smart_manager_welcome' ), 11 );
		add_action( 'admin_footer', array( $this, 'smart_manager_support_ticket_content' ) );

		$this->plugin_url = plugins_url( '', __FILE__ );
	}

	/**
	 * Handle welcome page
	 */
	public function show_welcome_page() {
		
		if( empty($_GET['landing-page']) ) {
			return;
		}
		
		switch ( $_GET['landing-page'] ) {
			case 'sm-about' :
				$this->about_screen();
			break;
			case 'sm-faqs' :
				$this->faqs_screen();
			break;
		}

		?>
		<script type="text/javascript">
			jQuery(document).ready(function() {
				jQuery('#toplevel_page_smart-manager').find('.wp-first-item').closest('li').removeClass('current');
				jQuery('#toplevel_page_smart-manager').find('a[href$=sm-about]').closest('li').addClass('current');
				jQuery('#toplevel_page_smart-manager').find('a[href$=sm-faqs]').closest('li').addClass('current');
				jQuery('#sa_smart_manager_beta_post_query_table').find('input[name="include_data"]').attr('checked', true);
			});
		</script>
		<?php

	}

	/**
	 * Add styles just for this page, and remove dashboard page links.
	 */
	public function admin_head() {

		if ( ! ( isset( $_GET['page'] ) && ( "smart-manager" === $_GET['page'] ) && ( isset( $_GET['landing-page'] ) ) ) ) {
			return;
		}
		?>
		<style type="text/css">
			/*<![CDATA[*/
			.sm-welcome.about-wrap {
				max-width: unset !important;
			}
			.sm-welcome.about-wrap h3 {
				margin-top: 1em;
				margin-right: 0em;
				margin-bottom: 0.1em;
				font-size: 1.25em;
				line-height: 1.3em;
			}
			.sm-welcome.about-wrap .button-primary {
				margin-top: 18px;
			}
			.sm-welcome.about-wrap .button-hero {
				color: #FFF!important;
				border-color: #03a025!important;
				background: #03a025 !important;
				box-shadow: 0 1px 0 #03a025;
				font-size: 1em;
				font-weight: bold;
			}
			.sm-welcome.about-wrap .button-hero:hover {
				color: #FFF!important;
				background: #0AAB2E!important;
				border-color: #0AAB2E!important;
			}
			.sm-welcome.about-wrap p {
				margin-top: 0.6em;
				margin-bottom: 0.8em;
				line-height: 1.6em;
				font-size: 14px;
			}
			.sm-welcome.about-wrap .feature-section {
				padding-bottom: 5px;
			}
			#sm_promo_msg_content a {
				color: #A3B745 !important;
			}
			#sm_promo_msg_content .button-primary {
				background: #a3b745 !important;
				border-color: #829237 #727f30 #727f30 !important;
				color: #fff !important;
				box-shadow: 0 1px 0 #727f30 !important;
				text-shadow: 0 -1px 1px #727f30, 1px 0 1px #727f30, 0 1px 1px #727f30, -1px 0 1px #727f30 !important;

				animation-duration: 5s;
				animation-iteration-count: infinite;
				animation-name: shake-hv;
				animation-timing-function: ease-in-out;
			}
			div#TB_window {
				background: lightgrey;
			}
			@keyframes shake-hv {
				0%, 80% {
					transform: translate(0, 0) rotate(0); }
				60%, 70% {
					transform: translate(0, -0.5px) rotate(2.5deg); }
				62%, 72% {
					transform: translate(0, 1.5px) rotate(-0.5deg); }
				65%, 75% {
					transform: translate(0, -1.5px) rotate(2.5deg); }
				67%, 77% {
					transform: translate(0, 2.5px) rotate(-1.5deg); } }

			#sm_promo_msg_content input[type=checkbox]:checked:before {
				color: #A3B745 !important;
			}
			#sm_promo_valid_msg {
				text-align: center;
				padding-left: 0.5em;
				font-size: 0.8em;
				float: left;
				padding-top: 0.25em;
				font-style: italic;
				color: #A3B745;
			}
			.update-nag, .updated, .error {
				display: none;
			}

			.sm-welcome-footer-btn {
				display: inline-flex;
				gap: 0.375rem;
				align-items: center;
				padding: 0.5rem 0.5rem;
				font-size: 0.875rem;
				line-height: 1.25rem;
			}

			.sm-welcome-footer-btn-text {
				font-size: 0.75rem;
				line-height: 1rem;
				white-space: nowrap;
			}

			.sm-video-container {
				position: relative;
				padding-top: 56.25%;
			}

			.sm-video-iframe {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
			}

			/*]]>*/
		</style>
		<script type="text/javascript">
			jQuery(function($) {
				$(document).ready(function() {
					$('#sm_promo_msg').insertBefore('.sm-welcome');
				});
			});
		</script>
		<?php
	}

	/**
	 * Smart Manager's Support Form
	 */
	function smart_manager_support_ticket_content() {

		if ( !( isset( $_GET['page'] ) && ( "smart-manager" === $_GET['page'] ) && ( isset( $_GET['landing-page'] ) && "sm-faqs" === $_GET['landing-page'] ) ) ) {
			return;
		}

		global $smart_manager_beta;

		if (!wp_script_is('thickbox')) {
			if (!function_exists('add_thickbox')) {
				require_once ABSPATH . 'wp-includes/general-template.php';
			}
			add_thickbox();
		}

		if( !is_callable( array( $smart_manager_beta, 'get_latest_upgrade_class' ) ) ){
			return;
		}

		$latest_upgrade_class = $smart_manager_beta->get_latest_upgrade_class();

		if ( ! method_exists( $latest_upgrade_class, 'support_ticket_content' ) ) return;

		$plugin_data = get_plugin_data( self::$plugin_file );
		$license_key = get_site_option( self::$prefix.'_license_key' );

		$latest_upgrade_class::support_ticket_content( self::$prefix, self::$sku, $plugin_data, $license_key, 'smart-manager-for-wp-e-commerce' );
	}

	/**
	 * Intro text/links shown on all about pages.
	 */
	private function intro() {

		$version = '';
		if( is_callable( array( 'Smart_Manager', 'get_version' ) ) ) {
			$version = Smart_Manager::get_version();
		}
		?>
		<h1><?php printf( 
		/* translators: %s: Plugin version number */
		__( 'Thank you for installing Smart Manager %s!', 'smart-manager-for-wp-e-commerce' ),
		$version ); ?></h1>

		<div style="margin-top:0.3em;"><?php _e( "Glad to have you onboard. We hope Smart Manager adds to your desired success 🏆", 'smart-manager-for-wp-e-commerce' ); ?></div>

		<div id="sm_welcome_feature_section" class="has-2-columns is-fullwidth feature-section col two-col">
			<div class="column col">
				<a href="<?php echo $this->sm_redirect_url; ?>" class="button button-hero"><?php _e( 'Get started with Smart Manager', 'smart-manager-for-wp-e-commerce' ); ?></a>
			</div>
			<div class="column col last-feature">
				<p align="right">
					<?php 
						if ( !wp_script_is( 'thickbox' ) ) {
							if ( !function_exists( 'add_thickbox' ) ) {
								require_once ABSPATH . 'wp-includes/general-template.php';
							}
							add_thickbox();
						}
						?>
							<a href="https://www.storeapps.org/support/contact-us/?utm_source=sm&utm_medium=welcome_page&utm_campaign=view_docs" target="_blank" class="sm-welcome-footer-btn">
								<svg width="10" height="15" viewBox="0 0 10 15" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M6.66504 8.66501C6.79837 7.99834 7.13171 7.53167 7.66504 6.99834C8.33171 6.39834 8.66504 5.53167 8.66504 4.66501C8.66504 3.60414 8.24361 2.58673 7.49347 1.83658C6.74332 1.08644 5.72591 0.665009 4.66504 0.665009C3.60417 0.665009 2.58676 1.08644 1.83661 1.83658C1.08647 2.58673 0.665039 3.60414 0.665039 4.66501C0.665039 5.33167 0.798372 6.13167 1.66504 6.99834C2.13171 7.46501 2.53171 7.99834 2.66504 8.66501M2.66504 11.3317H6.66504M3.33171 13.9983H5.99837" stroke="#2271b1" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
								<span class="sm-welcome-footer-btn-text"><?php echo __( 'Questions? Need Help?', 'smart-manager-for-wp-e-commerce' ); ?></span>
							</a>
							<?php echo __( 'or', 'smart-manager-for-wp-e-commerce' ); ?>
							<a href="https://calendly.com/storeapps/15min" target="_blank" class="sm-welcome-footer-btn">
								<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M13.3317 9.88001V11.6867C13.3324 11.8556 13.298 12.023 13.2306 12.178C13.1633 12.333 13.0646 12.4722 12.9409 12.5867C12.8173 12.7012 12.6713 12.7887 12.5121 12.8437C12.3529 12.8987 12.1839 12.9201 12.0157 12.9067C10.1575 12.7043 8.37302 12.0711 6.80566 11.0567C5.34829 10.1306 4.10578 8.88813 3.17967 7.43075C2.16202 5.85686 1.52875 4.06463 1.33041 2.19949C1.31707 2.03188 1.33823 1.86337 1.39277 1.70457C1.44731 1.54577 1.53406 1.40011 1.64758 1.27651C1.76111 1.15291 1.89917 1.05403 2.05306 0.986175C2.20695 0.918323 2.37321 0.882962 2.54167 0.882353H4.34834C4.64278 0.879565 4.92818 0.984338 5.1505 1.17718C5.37282 1.37002 5.51691 1.63762 5.55567 1.92949C5.62799 2.51306 5.76649 3.08668 5.96834 3.63949C6.05242 3.86807 6.0696 4.11588 6.01786 4.3541C5.96611 4.59231 5.84752 4.81072 5.67567 4.98416L4.91434 5.74549C5.77333 7.2559 7.05894 8.54151 8.56934 9.40049L9.33067 8.63916C9.5041 8.46731 9.72252 8.34872 9.96073 8.29697C10.1989 8.24523 10.4468 8.2624 10.6753 8.34649C11.2281 8.54834 11.8018 8.68684 12.3853 8.75916C12.6805 8.79827 12.9506 8.94505 13.1437 9.17115C13.3369 9.39724 13.4397 9.68697 13.4337 9.98401L13.3317 9.88001Z" stroke="#2271b1" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
								<span class="sm-welcome-footer-btn-text"><?php echo __( 'Book a Call', 'smart-manager-for-wp-e-commerce' ); ?></span>
							</a>
						<br>
					<?php if ( SMPRO === true ) { ?>
						<a class="button-primary" href="<?php echo admin_url( 'admin.php?page=smart-manager#!/settings' ); ?>" target="_blank"><?php _e( 'Settings', 'smart-manager-for-wp-e-commerce' ); ?></a>
					<?php } ?>
					<a class="button-primary" href="https://www.storeapps.org/knowledgebase_category/smart-manager/?utm_source=sm&utm_medium=welcome_page&utm_campaign=view_docs" target="_blank"><?php _e( 'Docs', 'smart-manager-for-wp-e-commerce' ); ?></a>
				</p>
			</div>
		</div>
		<br>
		<h2 class="nav-tab-wrapper">
			<a class="nav-tab <?php if ( $_GET['landing-page'] == 'sm-about' ) echo 'nav-tab-active'; ?>" href="<?php echo esc_url( add_query_arg( array( 'landing-page' => 'sm-about' ), $this->sm_redirect_url ) ); ?>">
				<?php _e( "Know Smart Manager", 'smart-manager-for-wp-e-commerce' ); ?>
			</a>
			<a class="nav-tab <?php if ( $_GET['landing-page'] == 'sm-faqs' ) echo 'nav-tab-active'; ?>" href="<?php echo esc_url( add_query_arg( array( 'landing-page' => 'sm-faqs' ), $this->sm_redirect_url ) ); ?>">
				<?php _e( "FAQ's", 'smart-manager-for-wp-e-commerce' ); ?>
			</a>
		</h2>
		<?php
	}

	/**
	 * Output the about screen.
	 */
	public function about_screen() {
		?>
		<div class="wrap sm-welcome about-wrap">

			<?php $this->intro();?>
			<div class = "col" style="margin:0 auto;">
				<br/>
				<p style="font-size:1em;"><?php echo __( 'Smart Manager is a unique, revolutionary tool that gives you the power to <b>boost your productivity by 10x</b> in managing your <b>WooCommerce</b> store by using a <b>familiar, single page, spreadsheet like interface</b>. ', 'smart-manager-for-wp-e-commerce' ); ?></p>
				<p><?php echo sprintf(
					/* translators: %s: HTML of Smart Manager about screen */
					__( 'Apart from WooCommerce post types like Products, Orders, Coupons, now you can manage %s. Be it Posts, Pages, Media, WordPress Users, etc. you can now manage everything using Smart Manager.', 'smart-manager-for-wp-e-commerce' ), '<strong>' . __( 'any custom post type in WordPress', 'smart-manager-for-wp-e-commerce' ) . '</strong>' ); ?></p>
				<!-- <div class="headline-feature feature-video">
					<?php echo $embed_code = wp_oembed_get('http://www.youtube.com/watch?v=kOiBXuUVF1U', array('width'=>5000, 'height'=>560)); ?>
				</div> -->
			</div>

			<h3 class="aligncenter"><?php echo __( 'Manage your entire store from a single screen', 'smart-manager-for-wp-e-commerce' ); ?></h3>
			<div class="has-3-columns is-fullwidth feature-section col three-col" >
				<div class="column col">
						<h3><?php echo __( 'Filter / Search Records', 'smart-manager-for-wp-e-commerce' ); ?></h3>
					<div class="sm-video-container">
						<iframe class="sm-video-iframe" src="https://www.youtube.com/embed/20iodFpP5ow" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
					</div>
						<p>
							<?php echo sprintf(
								/* translators: %1$s: Simple search doc link %2$s: Advanced search doc link */
								__( 'Simply enter the keyword you wish to filter records in the “Simple Search” field at the top of the grid (%1$s). If you need to have a more specific search result, then you can switch to “%2$s“ and then search.', 'smart-manager-for-wp-e-commerce' ),
								'<a href="https://www.storeapps.org/docs/sm-how-to-filter-records-using-simple-search/?utm_source=sm&utm_medium=welcome_page&utm_campaign=sm_know" target="_blank">' . __( 'see how', 'smart-manager-for-wp-e-commerce' ) . '</a>',
								'<a href="https://www.youtube.com/watch?v=hX7CcZYo060" target="_blank">' . __( 'Advanced Search', 'smart-manager-for-wp-e-commerce' ) . '</a>' ); ?>
						</p>
					</div>
				<div class="column col">
						<h3><?php echo __( 'Inline Editing', 'smart-manager-for-wp-e-commerce' ); ?></h3>
					<div class="sm-video-container">
						<iframe class="sm-video-iframe" src="https://www.youtube.com/embed/BrvU6GD9pWU" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
					</div>
						<p>
							<?php echo sprintf(
							/* translators: %s: Inline Editing doc link */
							__( 'You can quickly update your Products, Orders, Coupons and Posts from Smart Manager itself. This facilitates editing of multiple rows at a time instead of editing and saving each row separately, %s.', 'smart-manager-for-wp-e-commerce' ),
							'<a href="https://www.storeapps.org/docs/sm-how-to-use-inline-editing/?utm_source=sm&utm_medium=welcome_page&utm_campaign=sm_know" target="_blank">' . __( 'see how', 'smart-manager-for-wp-e-commerce' ) . '</a>' ); ?>
						</p>
					</div>
				<div class="column last-feature col">
						<h3><?php echo __( 'Show/Hide & Sort Data Columns', 'smart-manager-for-wp-e-commerce' ); ?></h3>
					<div class="sm-video-container">
						<iframe class="sm-video-iframe" src="https://www.youtube.com/embed/WHQtEsmPDbw" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
					</div>
						<p>
							<?php echo __( 'Show/hide multiple data columns of your WooCommerce store data as per your requirements. Sort them in ascending or descending order. Smart Manager also gives you persistent state management.', 'smart-manager-for-wp-e-commerce' ); ?>
						</p>
					</div>
				</div>
			<div class="has-3-columns is-fullwidth feature-section col three-col">
				<div class="column col">
					<h3><?php echo __( 'Delete Records', 'smart-manager-for-wp-e-commerce' ); ?></h3>
					<div class="sm-video-container">
						<iframe class="sm-video-iframe" src="https://www.youtube.com/embed/e9bpXTPdSqc" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
					</div>
						<p>
							<?php echo sprintf(
								/* translators: %s: Delete Records doc link */
								__( 'You can simply select records you want to delete (check the header box if you want to delete all records) and click on the “Delete” icon. All the selected records will be deleted. You can even delete records by applying search filters. %s.', 'smart-manager-for-wp-e-commerce' ),
								'<a href="https://www.storeapps.org/docs/sm-how-to-delete-rows/?utm_source=sm&utm_medium=welcome_page&utm_campaign=sm_know" target="_blank">' . __( 'See how', 'smart-manager-for-wp-e-commerce' ) . '</a>' ); ?>
						</p>
					</div>
				<div class="column col">
						<h3>
							<?php 
								if ( SMPRO === true ) {
									echo __( 'Bulk Edit', 'smart-manager-for-wp-e-commerce' );											
								} else {
									echo sprintf(
										/* translators: %1$s: HTML for bulk edit %2$s: link to Smart Manager Pro product page */
										__( 'Bulk Edit - %1$s (only in %2$s)', 'smart-manager-for-wp-e-commerce' ),
										'<span style="color: red;">' . __( 'Biggest Time Saver', 'smart-manager-for-wp-e-commerce' ) . '</span>' ,
										'<a href="https://www.storeapps.org/product/smart-manager/?utm_source=sm&utm_medium=welcome_page&utm_campaign=sm_know" target="_blank">' . __( 'Pro', 'smart-manager-for-wp-e-commerce' ) . '</a>' );
								}
							?>
						</h3>
					<div class="sm-video-container">
						<iframe class="sm-video-iframe" src="https://www.youtube.com/embed/COXCuX2rFrk" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
					</div>
						<p>
							<?php echo sprintf(
								/* translators: %s: Bulk Edit doc link */
								__( 'You can change / update multiple fields of the entire store OR for selected items by selecting multiple records and then click on Bulk Edit. %s.', 'smart-manager-for-wp-e-commerce' ),
								'<a href="https://www.storeapps.org/docs/sm-how-to-use-batch-update/?utm_source=sm&utm_medium=welcome_page&utm_campaign=sm_know" target="_blank">' . __( 'See how', 'smart-manager-for-wp-e-commerce' ) . '</a>' ); ?>
						</p>
					</div>
				<div class="column last-feature col">
						<h3><?php 
								if ( SMPRO === true ) {
									echo __( 'Export CSV', 'smart-manager-for-wp-e-commerce' );											
								} else {
									echo sprintf(
										/* translators: %s: Export CSV doc link */
										__( 'Export CSV (only in %s)', 'smart-manager-for-wp-e-commerce' ),
										'<a href="https://www.storeapps.org/product/smart-manager/?utm_source=sm&utm_medium=welcome_page&utm_campaign=sm_know" target="_blank">' . __( 'Pro', 'smart-manager-for-wp-e-commerce' ) . '</a>' );
								}
							?>
						</h3>
					<div class="sm-video-container">
						<iframe class="sm-video-iframe" src="https://www.youtube.com/embed/GMgysSQw7_g" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
					</div>
						<p>
							<?php echo sprintf(
								/* translators: %s: HTML of Export CSV */
								__( 'You can export all the records OR filtered records (%s) by simply clicking on the Export CSV button at the bottom right of the grid.', 'smart-manager-for-wp-e-commerce' ),
								'<i>' . __( 'using Simple Search” or Advanced Search', 'smart-manager-for-wp-e-commerce' ) . '</i>' ); ?>
						</p>
				</div>
			</div>
			<div class="changelog" style="font-size: 1.5em; text-align: center;">
				<h4><a href="<?php echo $this->sm_redirect_url; ?>"><?php _e( 'Get started with Smart Manager', 'smart-manager-for-wp-e-commerce' ); ?></a></h4>
			</div>
			<p style="text-align: right;">
				<a target="_blank" href="<?php echo esc_url( 'https://www.storeapps.org/shop/?utm_source=sm&utm_medium=welcome_page&utm_campaign=sm_know' ); ?>"><?php echo __( 'View our other WooCommerce plugins', 'smart-manager-for-wp-e-commerce' ); ?></a>
			</p>
		</div>
		<?php
	}

	/**
	 * Output the FAQ's screen.
	 */
	public function faqs_screen() {
		?>
		<div class="wrap sm-welcome about-wrap">

			<?php $this->intro(); ?>
		
			<h3 class="aligncenter"><?php echo __( "FAQ / Common Problems", 'smart-manager-for-wp-e-commerce' ); ?></h3>

			<?php
				$faqs = array(
							array(
									'que' => __( 'Smart Manager is empty?', 'smart-manager-for-wp-e-commerce' ),
									'ans' => sprintf(
										/* translators: %s: Changelog doc link */
										__( 'Make sure you are using %s of Smart Manager. If still the issue persist, temporarily de-activate all plugins except WooCommerce/WPeCommerce & Smart Manager. Re-check the issue, if the issue still persists, contact us. If the issue goes away, re-activate other plugins one-by-one & re-checking the fields, to find out which plugin is conflicting.', 'smart-manager-for-wp-e-commerce' ),
										'<a href="https://www.storeapps.org/docs/sm-changelog/" target="_blank">' . __( 'latest version', 'smart-manager-for-wp-e-commerce' ) . '</a>' )
								),
							array(
									'que' => __( 'Smart Manager search functionality not working', 'smart-manager-for-wp-e-commerce' ),
									'ans' => __( 'Request you to kindly de-activate and activate the Smart Manager plugin once and then have a recheck with the search functionality.', 'smart-manager-for-wp-e-commerce' )
								),
							array(
									'que' => __( 'Updating variation parent price/sales price not working?', 'smart-manager-for-wp-e-commerce' ),
									'ans' => __( 'Smart Manager is based on WooCommerce and WPeCommerce and the same e-commerce plugins sets the price/sales price of the variation parents automatically based on the price/sales price of its variations.', 'smart-manager-for-wp-e-commerce' )
								),
							array(
									'que' => __( 'How to manage any custom field of any custom plugin using Smart Manager?', 'smart-manager-for-wp-e-commerce' ),
									'ans' => __( 'Smart Manager will allow you to manage custom field of any other plugin.', 'smart-manager-for-wp-e-commerce' )
								),
							array(
									'que' => __( 'How to add columns to Smart Manager dashboard?', 'smart-manager-for-wp-e-commerce' ),
									'ans' => sprintf(
										/* translators: %s: Show and Hide doc link */
										__( 'To show / hide columns in the Smart Manager, %s.', 'smart-manager-for-wp-e-commerce' ),
										'<a href="https://www.storeapps.org/docs/sm-how-to-show-hide-columns-in-dashboard/?utm_source=sm&utm_medium=welcome_page&utm_campaign=sm_faqs" target="_blank">' . __( 'click here', 'smart-manager-for-wp-e-commerce' ) . '</a>')
								),
							array(
									'que' => __( 'Can I import using Smart Manager?', 'smart-manager-for-wp-e-commerce' ),
									'ans' => __( 'You cannot import using Smart Manager. Use import functionality of WooCommerce.', 'smart-manager-for-wp-e-commerce' )
								),
						);

				
				if ( SMPRO === true ) {
					$faqs[] = array(
									'que' => __( 'I can\'t find a way to do X...', 'smart-manager-for-wp-e-commerce' ),
									'ans' => sprintf(
										/* translators: %s: contact us link */
										__( 'Smart Manager is actively developed. If you can\'t find your favorite feature (or have a suggestion) %s. We\'d love to hear from you.', 'smart-manager-for-wp-e-commerce' ),
										'<a target="_blank" href="https://www.storeapps.org/support/contact-us/?utm_source=sm&utm_medium=welcome_page&utm_campaign=sm_faqs" title="' . __( 'Submit your query', 'smart-manager-for-wp-e-commerce' ) .'">' . __( 'contact us', 'smart-manager-for-wp-e-commerce' ) . '</a>' )
								);
				} else {
					$faqs[] = array(
									'que' => __( 'How do I upgrade a Lite version to a Pro version?', 'smart-manager-for-wp-e-commerce' ),
									'ans' => sprintf(
										/* translators: %s: Lite version to a Pro version doc link */
										__( 'Follow steps listed here: %s', 'smart-manager-for-wp-e-commerce' ),
										'<a href="https://www.storeapps.org/docs/how-to-update-from-lite-to-pro-version/" target="_blank">' . __( 'latest version', 'smart-manager-for-wp-e-commerce' ) . '</a>' )
								);
				}

				$faqs = array_chunk( $faqs, 2 );

				foreach ( $faqs as $fqs ) {
					echo '<div class="has-2-columns is-fullwidth two-col">';
					foreach ( $fqs as $index => $faq ) {
						echo '<div' . ( ( $index == 1 ) ? ' class="column col last-feature"' : ' class="column col"' ) . '>';
						echo '<h4>' . $faq['que'] . '</h4>';
						echo '<p>' . $faq['ans'] . '</p>';
						echo '</div>';
					}
					echo '</div>';
				}
			?>
		</div>
		
		<?php
	}


	/**
	 * Sends user to the welcome page on first activation.
	 */
	public function smart_manager_welcome() {

		if ( ! get_transient( '_sm_activation_redirect' ) ) {
			return;
		}
		
		// Delete the redirect transient
		delete_transient( '_sm_activation_redirect' );

		wp_redirect( admin_url( 'admin.php?page=smart-manager&landing-page=sm-about' ) );
		
		exit;

	}
}

$GLOBALS['smart_manager_admin_welcome'] = new Smart_Manager_Admin_Welcome();
