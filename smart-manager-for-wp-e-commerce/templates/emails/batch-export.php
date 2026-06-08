<?php
/**
 * Batch export email template
 *
 * @package   smart-manager-for-wp-e-commerce/templates/emails/
 * @since     8.89.0
 * @version   8.89.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$email_heading = _x( 'Your Export is Ready!', 'Email heading for batch export', 'smart-manager-for-wp-e-commerce' );
$current_user  = wp_get_current_user();
$display_name  = ( ! empty( $current_user ) && ( is_object( $current_user ) ) && ( ! empty( $current_user->display_name ) ) ) ? $current_user->display_name : _x( 'there', 'batch export email user display name', 'smart-manager-for-wp-e-commerce' );

if ( function_exists( 'wc_get_template' ) ) {
	wc_get_template( 'emails/email-header.php', array( 'email_heading' => $email_heading ) );
} elseif ( function_exists( 'woocommerce_get_template' ) ) {
	woocommerce_get_template( 'emails/email-header.php', array( 'email_heading' => $email_heading ) );
}

add_filter( 'wp_mail_content_type', 'sm_batch_export_set_content_type' );
if ( ! function_exists( 'sm_batch_export_set_content_type' ) ) {
	/**
	 * Set email content type to HTML.
	 *
	 * @return string Content type.
	 */
	function sm_batch_export_set_content_type() {
		return 'text/html';
	}
}

?>
<style type="text/css">
	.container {
		max-width: 37.5rem;
		margin: 0 auto;
	}
	.content {
		padding: 1.25rem;
	}
	.footer {
		padding: 1.25rem;
		text-align: center;
		font-size: 0.75rem;
		color: #777777;
	}
	a.download-link {
		background: <?php echo esc_attr( get_option( 'woocommerce_email_base_color', '#96588a' ) ); ?>;
		color: #ffffff;
		padding: 1rem 1.5rem;
		text-decoration: none;
		border-radius: 0.25rem;
		margin-bottom: 0.5rem;
		font-size: 1rem;
	}

	.warning-note {
		margin: 1.25rem 0 0;
		font-size: 0.875rem;
		line-height: 1.5;
		color: #856404;
		background-color: #fff3cd;
		padding: 0.75rem 1rem;
		border-radius: 0.375rem;
		border-left: 4px solid #ffc107;
	}
</style>
<?php

echo '
<div class="container">
	<div class="content">
		<p>' . sprintf(
			/* translators: %s: user display name */
			_x( 'Hi %s,', 'batch export email content', 'smart-manager-for-wp-e-commerce' ),
			esc_html( $display_name )
		) . '</p>
		<p>' . sprintf(
			/* translators: 1: record count, 2: dashboard name, 3: site name */
			_x( 'Your CSV export of <strong>%1$s %2$s</strong> from <strong>%3$s</strong> has been completed and is ready for download.', 'batch export email message', 'smart-manager-for-wp-e-commerce' ),
			esc_html( number_format( $record_count ) ),
			esc_html( $dashboard_name ),
			esc_html( $site_name )
		) . '</p>
		<p>' . _x( 'You can download your CSV file using the link below:', 'batch export email content', 'smart-manager-for-wp-e-commerce' ) . '</p>
		<p style="text-align:center; margin:1.5rem 0rem;">
			<a class="download-link" href="' . esc_url( $download_url ) . '" download=true>
				' . _x( 'Download CSV File', 'batch export email content', 'smart-manager-for-wp-e-commerce' ) . '
			</a>
		</p>

		<p class="warning-note"><strong>' . _x( 'Note:', 'batch export email content', 'smart-manager-for-wp-e-commerce' ) . '</strong> ' . _x( 'This download link will expire in 7 days. Please download your file before then.', 'batch export email content', 'smart-manager-for-wp-e-commerce' ) . '</p>
		<p>' . sprintf(
			/* translators: %s: contact us link */
			_x( 'If you have any questions or need help, feel free to reach out to our <a href="%s">support team</a>.', 'batch export email content', 'smart-manager-for-wp-e-commerce' ),
			'https://www.storeapps.org/support/contact-us/?utm_source=sm&utm_medium=email&utm_campaign=sm_batch_exports'
		) . '</p>
		<p style="margin-bottom:0">' . _x( 'Best regards,', 'batch export email content', 'smart-manager-for-wp-e-commerce' ) . '</p>
		<p>' . _x( 'The Smart Manager Team', 'batch export email content', 'smart-manager-for-wp-e-commerce' ) . '</p>
	</div>
	<br/>
	<div style="color:#9e9b9b;font-size:0.95em;text-align: center;">
		<div>' . _x( 'If you like', 'batch export email content', 'smart-manager-for-wp-e-commerce' ) . ' <strong>' . _x( 'Smart Manager', 'batch export email content', 'smart-manager-for-wp-e-commerce' ) . '</strong>' . _x( ', please leave us a', 'batch export email content', 'smart-manager-for-wp-e-commerce' ) . ' <a href="https://wordpress.org/support/view/plugin-reviews/smart-manager-for-wp-e-commerce?filter=5#postform" target="_blank" data-rated="Thanks :)">★★★★★</a> ' . _x( 'rating. A huge thank you from StoreApps in advance!', 'batch export email content', 'smart-manager-for-wp-e-commerce' ) . '</div>
	</div>
</div>';
echo '<br>';

if ( function_exists( 'wc_get_template' ) ) {
	wc_get_template( 'emails/email-footer.php' );
} elseif ( function_exists( 'woocommerce_get_template' ) ) {
	woocommerce_get_template( 'emails/email-footer.php' );
}
