<?php

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit; 
}

class StoreApps_Marketplace {
	public static function init() {
		?>
		<style type="text/css">
			.update-nag,
			.error,
			.updated,
			#sm_promo_msg,
			#wpfooter {
				display: none !important;
			}
			.wrap.about-wrap.sm-marketplace {
				margin: 0 auto;
				max-width: 90%;
			}
			body {
				background-color: #ffffff;
			}
			.sm-marketplace .marketplace-sections {
				display: flex;
				align-items: stretch;
				gap: 2em;
				margin: 0 0 2em 0;
			}
			.sm-marketplace .plugins-section {
				flex: 3 1 0;
				min-width: 0;
				display: flex;
				flex-direction: column;
			}
			.sm-marketplace .putler-section {
				flex: 1 1 280px;
				min-width: 260px;
				display: flex;
				flex-direction: column;
			}
			.sm-marketplace .section-divider {
				width: 1px;
				background: #e6e6e6;
				align-self: stretch;
			}
			.sm-marketplace .section-footer {
				text-align: center;
				margin-top: auto;
				padding-top: 1.5em;
			}
			.sm-marketplace .addons-banner-block-items {
				display: grid;
				grid-template-columns: repeat(3, 1fr);
				gap: 1.5em;
				flex: 1;
			}
			.sm-marketplace .addons-banner-block-item {
				border: 1px solid #e6e6e6;
				border-radius: 6px;
				box-sizing: border-box;
				min-width: 0;
				background: #ffffff;
			}
			.sm-marketplace .addons-banner-block-item.putler-card {
				border-color: #5850ec;
				background-color: #fbfaff;
			}
			.sm-marketplace .addons-banner-block-item-content {
				display: -webkit-box;
				display: -webkit-flex;
				display: flex;
				-webkit-box-orient: vertical;
				-webkit-box-direction: normal;
				-webkit-flex-direction: column;
				flex-direction: column;
				min-height: 220px;
				-webkit-box-pack: space-between;
				-webkit-justify-content: space-between;
				justify-content: space-between;
				padding: 24px;
				height: 100%;
				box-sizing: border-box;
			}
			.sm-marketplace .addons-banner-block-item-content h3 {
				margin-top: 0;
				font-weight: bold !important;
				font-size: 1.35em !important;
				display: flex;
				align-items: center;
				justify-content: space-between;
			}
			.sm-marketplace .addons-banner-block-item-content p {
				margin: 0 0 1.5em 0;
				color: #484c51 !important;
				line-height: 1.5;
			}
			.sm-marketplace .addons-button {
				border-radius: 4px;
				cursor: pointer;
				display: inline-block;
				height: 37px;
				line-height: 37px;
				text-align: center;
				text-decoration: none;
				padding: 0 16px;
				font-weight: 600;
			}
			.sm-marketplace .addons-button-solid {
				background-color: #4fad43;
				color: #fff;
			}
			.sm-marketplace .addons-button-solid:hover {
				color: #fff;
				opacity: .9;
			}
			.sm-marketplace .addons-button-putler {
				background-color: #5850ec;
				color: #fff;
			}
			.sm-marketplace .addons-button-putler:hover {
				color: #fff;
				opacity: .9;
			}
			.sm-marketplace .badge-saas {
				font-size: 10px;
				text-transform: uppercase;
				background: #eef2ff;
				color: #5850ec;
				padding: 2px 8px;
				border-radius: 12px;
				font-weight: 700;
				letter-spacing: 0.5px;
			}
			.sm-marketplace .products-header {
				text-align: center;
				padding: 0 0 2em;
			}
			.sm-marketplace .products-header h1 {
				margin: 1em 0 0.5em;
				color: #484c51 !important;
			}
			.sm-marketplace .products-header h2 {
				margin: 0.5em 0;
				font-size: 1.8em;
			}
			.sm-marketplace .page-description {
				margin-bottom: 1.6em;
			}
			.sm-marketplace .intro {
				text-align: center;
				font-size: 1.25em;
				letter-spacing: -0.018em;
				color: rgba(0, 0, 0, 0.75); 
			}
			.clr-b {
				color: #2c3338 !important;
			}
			.sm-marketplace .button.button-hero {
				color: #FFF !important;
				border-color: #5850ec !important;
				background: #5850ec !important;
				box-shadow: 0 1px 0 #5850ec;
				font-size: 1em;
				font-weight: bold;
			}

			@media (max-width: 1100px) {
				.sm-marketplace .marketplace-sections {
					flex-direction: column;
				}
				.sm-marketplace .section-divider {
					display: none;
				}
				.sm-marketplace .putler-section {
					border-top: 1px solid #e6e6e6;
					padding-top: 2em;
					margin-top: 1em;
				}
			}

			@media (max-width: 768px) {
				.sm-marketplace .addons-banner-block-items {
					grid-template-columns: 1fr;
				}
			}
		</style>

		<div class="wrap about-wrap sm-marketplace">
			<header class="products-header">
				<h1 class="products-header__title page-title"><?php echo esc_html__( 'Essential WooCommerce Tools & Apps', 'smart-manager-for-woocommerce-advanced-products-excel-style-silver' ); ?></h1>
				<div class="page-description">
					<h2 class="clr-b"><?php echo esc_html__( 'Get reliable WooCommerce extensions and analytics tools to sell more, manage your store, and make better decisions.', 'smart-manager-for-woocommerce-advanced-products-excel-style-silver' ); ?></h2>
					<p class="intro"><?php echo esc_html__( 'More than 250,000 store owners use our ecosystem of tools to drive growth and streamline operations.', 'smart-manager-for-woocommerce-advanced-products-excel-style-silver' ); ?></p>
				</div>
			</header>
			<div class="marketplace-sections">
				<div class="plugins-section">
					<div class="addons-banner-block-items">
						<div class="addons-banner-block-item">
							<div class="addons-banner-block-item-content">
								<div>
									<h3>Smart Offers</h3>
									<p>Grow your sales on autopilot. Create powerful WooCommerce upsells, downsells, cross-sells, BOGO, order bumps, sales funnels, and target offers to increase conversions &amp; maximize profits.</p>
								</div>
								<div>
									<a class="addons-button addons-button-solid" href="<?php echo esc_url( 'https://www.storeapps.org/product/smart-offers/?utm_source=sm&utm_medium=in_app_marketplace&utm_campaign=in_app_marketplace' ); ?>" target="_blank" rel="noopener">Learn more</a>
								</div>
							</div>
						</div>
						<div class="addons-banner-block-item">
							<div class="addons-banner-block-item-content">
								<div>
									<h3>Offermative</h3>
									<p>A plugin for dynamic discount pricing, related product recommendations, upsells, and automated funnels for WooCommerce.</p>
								</div>
								<div>
									<a class="addons-button addons-button-solid" href="<?php echo esc_url( 'https://wordpress.org/plugins/offermative-discount-pricing-related-products-upsell-funnels-for-woocommerce/' ); ?>" target="_blank" rel="noopener">Learn more</a>
								</div>
							</div>
						</div>
						<div class="addons-banner-block-item">
							<div class="addons-banner-block-item-content">
								<div>
									<h3>Bulk Variations Manager</h3>
									<p>Quickly create any combination of product variations from attributes and bulk update prices using differential pricing.</p>
								</div>
								<div>
									<a class="addons-button addons-button-solid" href="<?php echo esc_url( 'https://www.storeapps.org/product/bulk-variations-manager/?utm_source=sm&utm_medium=in_app_marketplace&utm_campaign=in_app_marketplace' ); ?>" target="_blank" rel="noopener">Learn more</a>
								</div>
							</div>
						</div>
					</div>
					<p class="section-footer">
						<a class="button button-hero" href="<?php echo esc_url( 'https://www.storeapps.org/woocommerce-plugins/?utm_source=sm&utm_medium=in_app_marketplace&utm_campaign=in_app_marketplace' ); ?>" target="_blank" rel="noopener">View all 20+ WooCommerce plugins</a>
					</p>
				</div>
				<div class="section-divider"></div>
				<div class="putler-section">
					<div class="addons-banner-block-item putler-card">
						<div class="addons-banner-block-item-content">
							<div>
								<h3>Putler <span class="badge-saas">SaaS App</span></h3>
								<p><strong>"Why don't my numbers match?"</strong><br>WooCommerce, your gateway, and your accountant each have a total, and none are wrong. Putler brings your stores and gateways into one reporting view so you can see where they stop agreeing.</p>
							</div>
							<div>
								<a class="addons-button addons-button-putler" href="<?php echo esc_url( 'https://www.putler.com/advanced-woocommerce-reporting/?utm_source=storeapps_marketplace&utm_medium=in_app&utm_campaign=woocommerce_reporting&utm_content=marketplace_card' ); ?>" target="_blank" rel="noopener">See how it works &rarr;</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<?php
	}
}

new StoreApps_Marketplace();