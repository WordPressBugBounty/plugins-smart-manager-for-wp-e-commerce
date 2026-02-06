<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* translators: %d: records count */
$email_heading = sprintf( _x( 'Stock Log Synchronization Completed for %d Records', 'email heading', 'smart-manager-for-wp-e-commerce' ), $background_process_params['id_count'] );

$current_user = wp_get_current_user();
$display_name = ( ! empty( $current_user ) && ( is_object( $current_user ) ) && ( ! empty( $current_user->display_name ) ) ) ? $current_user->display_name : _x( 'there', 'user display name', 'smart-manager-for-wp-e-commerce' );
if ( function_exists( 'wc_get_template' ) ) {
	wc_get_template( 'emails/email-header.php', array( 'email_heading' => $email_heading ) );
} else if ( function_exists( 'woocommerce_get_template' ) ) {
	woocommerce_get_template( 'emails/email-header.php', array( 'email_heading' => $email_heading ) );
} else {
	echo $email_heading;
}

add_filter( 'wp_mail_content_type','sm_beta_pro_batch_set_content_type' );

function sm_beta_pro_batch_set_content_type(){
    return "text/html";
}

?>
<style type="text/css">
	.sm_code {
		padding: 3px 5px 2px;
		margin: 0 1px;
		background: rgba(0,0,0,.07);
	}
	#template_header {
		background-color: #7748AA !important;
		text-align: center !important;
	}
</style>
<?php
/* translators: %s: user display name */
$msg_body = '<p>'. sprintf( _x( 'Hi %s,', 'user name in email content', 'smart-manager-for-wp-e-commerce' ), $display_name ) .'</p>';

$msg_body.= '<p>'. __( 'Smart Manager has successfully completed', 'smart-manager-for-wp-e-commerce'  ) .' \''. $background_process_params['process_name'] .'\' process on <span class="sm_code">'. get_bloginfo() .'</span>. </p>';

$msg_body .= '<br/>
				<p>
				<div style="color:#9e9b9b;font-size:0.95em;text-align: center;"> <div> '. __('If you like', 'smart-manager-for-wp-e-commerce' ) .' <strong>'. __('Smart Manager', 'smart-manager-for-wp-e-commerce' ) .'</strong>'. __(', please leave us a', 'smart-manager-for-wp-e-commerce' ) .' <a href="https://wordpress.org/support/view/plugin-reviews/smart-manager-for-wp-e-commerce?filter=5#postform" target="_blank" data-rated="Thanks :)">★★★★★</a> '.__('rating. A huge thank you from StoreApps in advance!', 'smart-manager-for-wp-e-commerce' ).'</div>';


echo $msg_body;
echo '<br>';

if ( function_exists( 'wc_get_template' ) ) {
	wc_get_template( 'emails/email-footer.php' );
} else if ( function_exists( 'woocommerce_get_template' ) ) {
	woocommerce_get_template( 'emails/email-footer.php' );
}
