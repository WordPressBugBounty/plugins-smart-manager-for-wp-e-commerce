(function (window) {
	function SmartManagerProduct() {
		if(typeof SmartManagerPro != 'undefined') {
			SmartManagerPro.apply();
		}
		else {
			SmartManager.apply();
		}
	}
	SmartManagerProduct.prototype = (typeof SmartManagerPro != 'undefined') ? Object.create(SmartManagerPro.prototype) : Object.create(SmartManager.prototype);
	SmartManagerProduct.prototype.constructor = SmartManagerProduct;

	SmartManagerProduct.prototype.refreshDashboardStates = function() {
		SmartManager.prototype.refreshDashboardStates.apply(this);
		if( window.smart_manager.dashboardKey == 'product' ) {
			let tempDashModel = JSON.parse(JSON.stringify(window.smart_manager.currentDashboardModel));
			window.smart_manager.dashboardStates[window.smart_manager.dashboardKey] = JSON.parse( window.smart_manager.dashboardStates[window.smart_manager.dashboardKey] );
			window.smart_manager.dashboardStates[window.smart_manager.dashboardKey]['treegrid'] = ( tempDashModel.hasOwnProperty('treegrid') ) ? tempDashModel.treegrid : false;
			window.smart_manager.dashboardStates[window.smart_manager.dashboardKey] = JSON.stringify( window.smart_manager.dashboardStates[window.smart_manager.dashboardKey] );
		}
	}

	SmartManager.prototype.setProductTypeValuesFromColModel = function() {
		if (!window.smart_manager.currentColModel){
			return;
		} 
		window.smart_manager.currentColModel.forEach(function(value) {
			if ( value.hasOwnProperty('data') && value.hasOwnProperty('selectOptions') && value.data === 'terms_product_type') {
				window.smart_manager.productTypeValues = value.selectOptions;
			}
		});
	}

	SmartManager.prototype.getSelectedSubscriptionProductIds = function() {
		window.smart_manager.setProductTypeValuesFromColModel();
		if ( !window.smart_manager.selectedRows || !window.smart_manager.currentDashboardData || !window.smart_manager.productTypeValues ) {
			return [];
		}
		const subscriptionTypes = ['Subscription', 'Variable Subscription'];
		const subscriptionIds = [];
		window.smart_manager.selectedRows.forEach(function(rowIndex) {
			const rowData = window.smart_manager.currentDashboardData[rowIndex];
			if (!rowData) return;
			const prodTypeId = rowData.terms_product_type;
			const typeName = window.smart_manager.productTypeValues[prodTypeId] || prodTypeId;
			if (subscriptionTypes.includes(typeName)) {
				subscriptionIds.push(rowData.posts_id);
			}
		});
		return subscriptionIds;
	}

	// Helper function to generate attribute card HTML
	SmartManager.prototype.generateAttributeCardHtml = function(params) {
		const { attrKey, attrLabel, attrValue, attrType, isTaxonomy, visibilityChecked, variationChecked, position, selectedValues } = params;
		const idx = window.smart_manager.prodAttrDisplayIndex;
		const inputClass = 'w-full px-3 py-1.5 text-sm border border-sm-base-input rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-sm-base-primary focus:border-sm-base-primary';
		const checkboxClass = 'm-0 w-4 h-4 rounded border-sm-base-input text-sm-base-primary focus:ring-sm-base-primary';
		const btnPrimaryClass = 'select_all_attributes px-3 py-1.5 text-sm font-medium text-sm-base-primary-foreground bg-sm-base-primary rounded-md hover:bg-[#5850d6] transition-colors cursor-pointer';
		const btnSecondaryClass = 'select_no_attributes px-3 py-1.5 text-sm font-medium text-sm-base-foreground bg-sm-base-muted border border-sm-base-input rounded-md hover:bg-[#e5e5e5] transition-colors cursor-pointer';

		let html = '<div class="mt-4 sm-attribute-card flex gap-4 items-start border-b border-sm-base-border last:border-b-0">';
		
		// Left column
		html += '<div class="flex flex-col gap-2 min-w-[10rem]">';
		html += (isTaxonomy == 1)
			? '<p class="m-0 font-semibold text-sm text-sm-base-foreground">'+attrLabel+':</p><input type="hidden" name="attribute_names['+idx+']" index="'+idx+'" value="'+attrKey+'" />'
			: '<input type="text" class="'+inputClass+'" name="attribute_names['+idx+']" index="'+idx+'" placeholder="'+_x('Name', 'placeholder', 'smart-manager-for-wp-e-commerce')+'" value="'+attrLabel+'">';
		
		// Checkboxes
		html += '<label class="flex items-center gap-2 text-sm text-sm-base-foreground cursor-pointer"><input type="checkbox" class="'+checkboxClass+'" id="attribute_visibility_'+attrKey+'" name="attribute_visibility['+idx+']" '+visibilityChecked+'>'+_x('Visible on the product page', 'visibility option for WooCommerce product attributes', 'smart-manager-for-wp-e-commerce')+'</label>';
		html += '<label class="flex items-center gap-2 text-sm text-sm-base-foreground cursor-pointer"><input type="checkbox" class="'+checkboxClass+'" id="attribute_variation_'+attrKey+'" name="attribute_variation['+idx+']" '+variationChecked+'>'+_x('Used for variations', 'use for variations option for WooCommerce product attributes', 'smart-manager-for-wp-e-commerce')+'</label>';
		
		// Position
		html += '<div class="flex items-center gap-2 mb-4"><span class="text-sm text-sm-base-muted-foreground">'+_x('Position:', 'position checkbox for WooCommerce product attributes', 'smart-manager-for-wp-e-commerce')+'</span>';
		html += '<input type="number" class="w-16 px-2 py-1 text-sm border border-sm-base-input rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-sm-base-primary focus:border-sm-base-primary" name="attribute_position['+idx+']" value="'+position+'">';
		html += '<input type="hidden" name="attribute_taxonomy['+idx+']" value="'+isTaxonomy+'"></div></div>';
		
		// Right column
		html += '<div class="flex-1 flex flex-col gap-2">';
		if (isTaxonomy == 1 && attrType !== 'text') {
			html += '<select id="'+attrKey+'" multiple="multiple" data-placeholder="'+_x('Select terms', 'placeholder', 'smart-manager-for-wp-e-commerce')+'" name="attribute_values['+idx+'][]" class="multiselect">';
			if (attrValue && typeof attrValue === 'object') {
				Object.entries(attrValue).forEach(([termKey, termValue]) => {
					const selected = (selectedValues && selectedValues.hasOwnProperty(termKey)) ? ' selected' : '';
					html += '<option value="'+termKey+'"'+selected+'>'+termValue+'</option>';
				});
			}
			html += '</select><div class="flex gap-2"><button type="button" class="'+btnPrimaryClass+'">'+_x('Select all', 'button for selecting WooCommerce product attribute', 'smart-manager-for-wp-e-commerce')+'</button>';
			html += '<button type="button" class="'+btnSecondaryClass+'">'+_x('Select none', 'button for selecting WooCommerce product attribute', 'smart-manager-for-wp-e-commerce')+'</button></div>';
		} else {
			html += '<input type="text" class="'+inputClass+'" id="'+attrLabel+'" name="attribute_values['+idx+']" value="'+attrValue+'" placeholder="'+_x('Pipe (|) separate terms', 'placeholder', 'smart-manager-for-wp-e-commerce')+'">';
		}
		html += '</div></div>';
		
		return html;
	}

	//Function to handle Product Attribute Inline Edit
	SmartManager.prototype.prodAttributeInlineEdit = function (params) {
		if ('undefined' === typeof (window.smart_manager.editedAttribueSlugs)) {
			return;
		}
		let attributesEditedText = '',
			productAttributesPostmeta = {};
		window.smart_manager.editedAttribueSlugs = '';
		jQuery('#edit_product_attributes input[name^="attribute_names"]').each(function () {
			let index = jQuery(this).attr('index'),
				attrExactNm = attrNm = jQuery(this).val(),
				isTaxonomy = parseInt(jQuery("input[name='attribute_taxonomy[" + index + "]']").val()),
				editedValue = '',
				editedText = '',
				selectedText = '',
				selectedVal = '';
			if (attributesEditedText.length > 0 && (window.smart_manager.editedAttribueSlugs).length > 0) {
				attributesEditedText += ', <br>';
				window.smart_manager.editedAttribueSlugs += ', <br>';
			}
			if (jQuery("input[name='attribute_values[" + index + "]']").attr('type') !== undefined && jQuery("input[name='attribute_values[" + index + "]']").attr('type') == "text") {
				editedValue = jQuery("input[name='attribute_values[" + index + "]']").val();

				if (editedValue == '') {
					return;
				}

				editedText = editedValue.split("|");
				editedText = editedText.map(text => text.trim());
				editedValue = editedText.join(" | ");

				if (isTaxonomy == 1) {
					attributesEditedText += attributesEditedText[attrNm] + ': [' + editedText + ']';
					window.smart_manager.editedAttribueSlugs += window.smart_manager.editedAttribueSlugs[attrNm] + ': [' + editedText + ']';
					editedValue = editedText;
				} else if (isTaxonomy == 0) {
					attributesEditedText += attrNm + ': [' + editedValue + ']';
					window.smart_manager.editedAttribueSlugs += attrNm + ': [' + editedValue + ']';
					attrNm = attrNm.replace(/( )/g, "-").replace(/([^a-z A-Z 0-9][^\w\s])/gi, '').toLowerCase();
				}

			} else {

				selectedText = jQuery("select[name='attribute_values[" + index + "][]'] option:selected").map(function () {
					return jQuery(this).text();
				}).get().join(' | ');

				if (selectedText == '') {
					return;
				}

				selectedVal = jQuery("select[name='attribute_values[" + index + "][]'] option:selected").map(function () {
					return jQuery(this).val();
				}).get();

				editedValue = {};

				if (window.smart_manager.prodAttributeActualValues.hasOwnProperty(attrNm) && window.smart_manager.prodAttributeActualValues[attrNm].hasOwnProperty('val')) {
					selectedVal.forEach((index) => {
						editedValue[index] = window.smart_manager.prodAttributeActualValues[attrNm].val[index];
					});
				}
				let attributeName = (attrNm) ? attrNm.substr(3) : '';
				window.smart_manager.editedAttribueSlugs += ((attributeName) ? attributeName : '') + ': [' + selectedText + ']';
				attributesEditedText += ((window.smart_manager.prodAttributeActualValues.hasOwnProperty(attrNm) && window.smart_manager.prodAttributeActualValues[attrNm].hasOwnProperty('lbl')) ? window.smart_manager.prodAttributeActualValues[attrNm].lbl : '') + ': [' + selectedText + ']';
			}
			productAttributesPostmeta[attrNm] = {};
			productAttributesPostmeta[attrNm]['name'] = attrExactNm;
			productAttributesPostmeta[attrNm]['value'] = editedValue;
			productAttributesPostmeta[attrNm]['position'] = jQuery("input[name='attribute_position[" + index + "]']").val();

			if (jQuery("input[name='attribute_visibility[" + index + "]']").is(":checked")) {
				productAttributesPostmeta[attrNm]['is_visible'] = 1;
			} else {
				productAttributesPostmeta[attrNm]['is_visible'] = 0;
			}

			if (jQuery("input[name='attribute_variation[" + index + "]']").is(":checked")) {
				productAttributesPostmeta[attrNm]['is_variation'] = 1;
			} else {
				productAttributesPostmeta[attrNm]['is_variation'] = 0;
			}
			productAttributesPostmeta[attrNm]['is_taxonomy'] = isTaxonomy;
		});


		window.smart_manager.hot.setDataAtRowProp(params.coords.row, 'postmeta_meta_key__product_attributes_meta_value__product_attributes', ((Object.keys(productAttributesPostmeta).length > 0) ? JSON.stringify(productAttributesPostmeta) : ''), 'sm.longstring_product_attributes_inline_update');
		window.smart_manager.hot.setDataAtCell(params.coords.row, params.coords.col, attributesEditedText, 'sm.longstring_product_attributes_inline_update');
	}

	//Function to handle 'import CSV' button
	SmartManager.prototype.showImportButtonHtml = function () {
		// Add click handler to navbar import button
		jQuery('#sm_navbar_import_btn').off('click').on('click', function () {
			if ((typeof window.smart_manager.dirtyRowColIds !== 'undefined') && Object.getOwnPropertyNames(window.smart_manager.dirtyRowColIds).length > 0) {
				window.smart_manager.confirmUnsavedChanges({ 'yesCallback': window.smart_manager.handleProductImportCSV })
			} else if ("undefined" !== typeof (window.smart_manager.handleProductImportCSV) && "function" === typeof (window.smart_manager.handleProductImportCSV)) {
				window.smart_manager.handleProductImportCSV()
			}
		})
	}

	//Function to handle 'show variations' checkbox - renders toggle HTML in header
	SmartManager.prototype.showVariationsHtml = function () {
		if (window.smart_manager.dashboardKey !== 'product') {
			jQuery('#sm-header-center-extras').empty();
			return;
		}
		
		const showVariationsChecked = (window.smart_manager.currentDashboardModel && window.smart_manager.currentDashboardModel.treegrid === 'true') ? 'checked' : '';
		const toggleHtml = `
			<label class="gap-2 text-[0.8125rem] leading-4 text-sm-base-foreground md:inline-flex items-center select-none cursor-pointer shrink-0" for="sm-toggle-variations">
				<span>${_x('Show variations', 'toggle', 'smart-manager-for-wp-e-commerce')}</span>
				<span class="w-8.5 h-4.5 relative inline-flex items-center">
					<input id="sm-toggle-variations" type="checkbox" class="m-0 peer sr-only" ${showVariationsChecked} />
					<span class="sm-toggle-track absolute inset-0 rounded-[0.625rem] bg-[#d4d4d8] peer-checked:bg-sm-base-primary transition-colors duration-200"></span>
					<span class="sm-toggle-thumb absolute left-0.5 w-3 h-3 rounded-lg bg-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] peer-checked:translate-x-4 transition-transform duration-200"></span>
				</span>
			</label>
		`;
		jQuery('#sm-header-center-extras').html(toggleHtml);
	}

	// Function to get show variations state for getData params
	SmartManager.prototype.getShowVariationsState = function () {
		return jQuery('#sm-toggle-variations').is(':checked');
	}

	//Function to change 'export csv' button HTML
	SmartManager.prototype.changeExportButtonHtml = function () {
		if (document.getElementById('sm_export_csv') !== null) {
			document.getElementById('sm_export_csv').innerHTML = '<a id="sm_export_entire_store_stock_cols" class="sm_entire_store" href="#">' + _x('Entire Store - Stock Columns', 'export button', 'smart-manager-for-wp-e-commerce') + '</a>' +
			'<a id="sm_export_entire_store_visible_cols" class="sm_entire_store" href="#">' + _x('Entire Store - Visible Columns', 'export button', 'smart-manager-for-wp-e-commerce') + '</a>';
		}
	}
	SmartManager.prototype.setExportButtonHTML = function () {
		if (window.smart_manager.dashboardKey === 'product') {
			if (document.getElementById('sm_export_entire_store_stock_cols') !== null) {
				document.getElementById('sm_export_entire_store_stock_cols').innerHTML = (window.smart_manager.isFilteredData()) ? _x('All Items In Search Results - Stock Columns', 'export button', 'smart-manager-for-wp-e-commerce') : _x('Entire Store - Stock Columns', 'export button', 'smart-manager-for-wp-e-commerce');
			}
			if (document.getElementById('sm_export_entire_store_visible_cols') !== null) {
				document.getElementById('sm_export_entire_store_visible_cols').innerHTML = (window.smart_manager.isFilteredData()) ? _x('All Items In Search Results - Visible Columns', 'export button', 'smart-manager-for-wp-e-commerce') : _x('Entire Store - Visible Columns', 'export button', 'smart-manager-for-wp-e-commerce');
			}
		}
	}
	// Function for handling the 'Show Variations' when click on it during unsaved changes.
	SmartManager.prototype.handleShowVariations = function () {
		jQuery('#sm-toggle-variations').prop('checked', !jQuery('#sm-toggle-variations').prop('checked'));
	}
	//Function for redirecting to WC product import
	SmartManager.prototype.handleProductImportCSV = function(){
		if(!window.smart_manager.WCProductImportURL || "undefined" === typeof(window.smart_manager.WCProductImportURL)){
			return;
		}
		if((window.smart_manager?.allSettings?.general?.toggle?.generate_sku === 'yes') && ("undefined" !== typeof(window.smart_manager.showConfirmDialog) && "function" === typeof(window.smart_manager.showConfirmDialog))){
			window.smart_manager.showConfirmDialog({
				content:_x("<strong>Note:</strong> Auto-generation of SKUs is enabled. Products with blank SKUs in your CSV will have SKUs automatically assigned during import.<br><br> To disable this, uncheck the <strong>“Automatically generate SKUs for WooCommerce products with blank values during CSV import”</strong>, setting under <strong>Settings > General Settings</strong>, then re-try the import.",'product import csv modal content','smart-manager-for-wp-e-commerce'),
				btnParams:{
					yesCallback: function(){
						window.open(window.smart_manager.WCProductImportURL, '_blank');
					}
				},
				title:'<span class="sm-error-icon"><span class="dashicons dashicons-warning" style="vertical-align: text-bottom;"></span>&nbsp;'+_x('Attention!', 'modal title', 'smart-manager-for-wp-e-commerce')+'</span>'
			});
			return;
		}
		window.open(window.smart_manager.WCProductImportURL, '_blank');
	}
	if (typeof window.smart_manager_product === 'undefined') {
		window.smart_manager = new SmartManagerProduct();
	}
})(window);

jQuery(document).on('sm_dashboard_change', '#sm_editor_grid', function() {
	// Clear variations toggle if not on product dashboard
	if (window.smart_manager.dashboardKey !== 'product') {
		jQuery('#sm-header-center-extras').empty();
	}
})

// Show variations toggle change handler
.on('change', '#sm-toggle-variations', function () {
	const isChecked = jQuery(this).is(':checked');
	// Update dashboard model for variations
	if (window.smart_manager.currentDashboardModel && window.smart_manager.currentDashboardModel.tables && window.smart_manager.currentDashboardModel.tables.posts) {
		if (isChecked) {
			window.smart_manager.currentDashboardModel.tables.posts.where.post_type = ['product', 'product_variation'];
			window.smart_manager.currentDashboardModel.treegrid = 'true';
		} else {
			window.smart_manager.currentDashboardModel.tables.posts.where.post_type = 'product';
			window.smart_manager.currentDashboardModel.treegrid = 'false';
		}
	}
	// Refresh grid to show/hide variations
	if ((typeof window.smart_manager.dirtyRowColIds !== 'undefined') && Object.getOwnPropertyNames(window.smart_manager.dirtyRowColIds).length > 0) {
		window.smart_manager.confirmUnsavedChanges({ 'yesCallback': function() {
			window.smart_manager.updateState();
			window.smart_manager.refresh();
		}, 'noCallback': function() {
			// Revert checkbox state
			jQuery('#sm-toggle-variations').prop('checked', !isChecked);
		}})
	} else {
		if (typeof window.smart_manager.updateState === 'function') {
			window.smart_manager.updateState();
		}
		if (typeof window.smart_manager.refresh === 'function') {
			window.smart_manager.refresh();
		}
	}
})

.on('smart_manager_init', '#sm_editor_grid', function() { //For add row functionality

	if (typeof( window.smart_manager.defaultColumnsAddRow ) == 'undefined') {
		return;
	}

	window.smart_manager.defaultColumnsAddRow.push('terms_product_type');
})

.on('smart_manager_post_load_grid','#sm_editor_grid', function() {
	if( window.smart_manager.dashboardKey == 'product' ) {
		window.smart_manager.excludedEditedFieldKeys = ['postmeta/meta_key=_product_attributes/meta_value=_product_attributes'];

		window.smart_manager.showVariationsHtml(); //Call to function for 'show variations' checkbox
		window.smart_manager.showImportButtonHtml(); //Call to function for 'import CSV' button
		window.smart_manager.changeExportButtonHtml(); //Call to function for 'export CSV' button

		// ,'posts_post_status'
		let variationsDisabledColumns = new Array('posts_post_title','posts_post_date','posts_post_date_gmt','posts_post_modified','posts_post_modified_gmt','posts_post_content','posts_post_excerpt','posts_post_password','terms_product_cat','postmeta_meta_key__default_attributes_meta_value__default_attributes','custom_product_attributes','terms_product_type','terms_product_visibility','terms_product_visibility_featured','postmeta_meta_key__wc_mmax_prd_opt_enable_meta_value__wc_mmax_prd_opt_enable','postmeta_meta_key__wc_mmax_min_meta_value__wc_mmax_min','postmeta_meta_key__wc_mmax_max_meta_value__wc_mmax_max','postmeta_meta_key_allow_combination_meta_value_allow_combination','postmeta_meta_key_minimum_allowed_quantity_meta_value_minimum_allowed_quantity','postmeta_meta_key_maximum_allowed_quantity_meta_value_maximum_allowed_quantity','postmeta_meta_key_group_of_quantity_meta_value_group_of_quantity','postmeta_meta_key_min_quantity_meta_value_min_quantity','postmeta_meta_key_max_quantity_meta_value_max_quantity','postmeta_meta_key_minmax_do_not_count_meta_value_minmax_do_not_count','postmeta_meta_key_minmax_cart_exclude_meta_value_minmax_cart_exclude','postmeta_meta_key_minmax_category_group_of_exclude_meta_value_minmax_category_group_of_exclude');
		let parentDisabledColumns = new Array('postmeta_meta_key_min_max_rules_meta_value_min_max_rules','postmeta_meta_key_variation_minimum_allowed_quantity_meta_value_variation_minimum_allowed_quantity','postmeta_meta_key_variation_maximum_allowed_quantity_meta_value_variation_maximum_allowed_quantity','postmeta_meta_key_variation_group_of_quantity_meta_value_variation_group_of_quantity','postmeta_meta_key_min_quantity_var_meta_value_min_quantity_var','postmeta_meta_key_max_quantity_var_meta_value_max_quantity_var','postmeta_meta_key_variation_minmax_do_not_count_meta_value_variation_minmax_do_not_count','postmeta_meta_key_variation_minmax_cart_exclude_meta_value_variation_minmax_cart_exclude','postmeta_meta_key_variation_minmax_category_group_of_exclude_meta_value_variation_minmax_category_group_of_exclude');

		window.smart_manager.hot.updateSettings({
			cells: function(row, col, prop){

				let cellProperties = {},
					isLeaf = window.smart_manager.hot.getDataAtRowProp(row, 'isLeaf'),
					isVariation = window.smart_manager.hot.getDataAtRowProp(row, 'posts_post_parent'),
				 	colObj = ( ( window.smart_manager.currentVisibleColumns.indexOf(col) != -1 ) ? window.smart_manager.currentVisibleColumns[col] : {} ),
				 	nonNumericRenderCols = new Array('postmeta_meta_key__sale_price_meta_value__sale_price', 'postmeta_meta_key__regular_price_meta_value__regular_price');

				let customRenderer = window.smart_manager.getCustomRenderer( col );

				isVariation = ( isVariation ) ? parseInt(isVariation) : 0;

				if( customRenderer != '' ) {
					cellProperties.renderer = customRenderer;
				}

				if( colObj.hasOwnProperty('type') ) {
					if( nonNumericRenderCols.indexOf(prop) != -1 ) {
						cellProperties.renderer = 'customTextRenderer';
					}
				}

				if( isVariation > 0 && variationsDisabledColumns.indexOf(prop) != -1 ) {
					cellProperties.readOnly = 'true';

					if( prop === 'posts_post_title' && true === isLeaf ) {
						cellProperties.renderer = 'customHtmlRenderer';
					}

					if( 'terms_product_type' === prop || 'terms_product_visibility_featured' === prop ) {
						cellProperties.renderer = 'customTextRenderer';
						cellProperties.readOnly = 'true';
					}
				}
				if (0 === isVariation && (parentDisabledColumns.indexOf(prop) != -1 || (prop && (typeof prop === 'string') && prop.includes('postmeta_meta_key_attribute_pa_') ) ) ) {
					cellProperties.renderer = 'customTextRenderer';
					cellProperties.readOnly = 'true';
				}

				if( Object.entries(cellProperties).length !== 0 ) {
					return cellProperties;
				}

			}
		});
	}
})

.on('sm_grid_on_afterOnCellMouseUp','#sm_editor_grid', function(e, params) { //for handling attribute inline edit

	if( typeof( params.colObj.prop ) == 'undefined' || (typeof( params.colObj.prop ) != 'undefined' && params.colObj.prop != 'custom_product_attributes') || window.smart_manager.dashboardKey != 'product' ) {
		return;
	}


	window.smart_manager.defaultEditor = false;
	window.smart_manager.prodIsVariation = false;
	window.smart_manager.prodAttrDisplayIndex = 0;
	window.smart_manager.prodAttributeActualValues = ( typeof( params.colObj.values ) != 'undefined' ) ? params.colObj.values : '';

	let attributeList = '<option value="custom">'+_x('Custom product attribute', 'WooCommerce product attributes list', 'smart-manager-for-wp-e-commerce')+'</option>',
		attrSelectedList = '',
		dlgTitle = '',
		dlgContent = '',
		isVariation = false,
		selectedAttributes = new Array();

	//Code for setting is_variation flag
	if( typeof( window.smart_manager.currentColModel ) != 'undefined' ) {
		window.smart_manager.currentColModel.forEach(function(value) {
			if( value.hasOwnProperty('data') && value.hasOwnProperty('selectOptions') && value.data == 'terms_product_type' ) {
				window.smart_manager.productTypeValues = value.selectOptions;
			}
		});

		let prodTypeId = window.smart_manager.hot.getDataAtRowProp( params.coords.row, 'terms_product_type' );
		if( prodTypeId != '' && window.smart_manager.productTypeValues.hasOwnProperty(prodTypeId) ) {
			if( window.smart_manager.productTypeValues[prodTypeId] == 'Variable' || window.smart_manager.productTypeValues[prodTypeId] == 'Variable Subscription' ) {
				isVariation = true;
			}
		}
	}

	let productAttributesSerialized = window.smart_manager.hot.getDataAtRowProp(params.coords.row, 'postmeta_meta_key__product_attributes_meta_value__product_attributes');
		productAttributesSerialized = ( window.smart_manager.isJSON( productAttributesSerialized ) ) ? JSON.parse( productAttributesSerialized ) : '';
	if( productAttributesSerialized && typeof( productAttributesSerialized ) === 'object' ) {

		Object.entries(productAttributesSerialized).forEach(([key, obj]) => {
			let isTaxonomy = ( obj.hasOwnProperty('is_taxonomy') ) ? obj.is_taxonomy : '';

			selectedAttributes.push(key);

			//Code for defined attributes
			if( isTaxonomy == 1 ) {
				attrLabel = ( typeof( window.smart_manager.prodAttributeActualValues[key] ) != 'undefined' && window.smart_manager.prodAttributeActualValues[key].hasOwnProperty('lbl') ) ? window.smart_manager.prodAttributeActualValues[key].lbl : '';
				attrType = ( typeof( window.smart_manager.prodAttributeActualValues[key] ) != 'undefined' && window.smart_manager.prodAttributeActualValues[key].hasOwnProperty('type') ) ? window.smart_manager.prodAttributeActualValues[key].type : '';
				attrValue = ( typeof( window.smart_manager.prodAttributeActualValues[key] ) != 'undefined' && window.smart_manager.prodAttributeActualValues[key].hasOwnProperty('val') ) ? window.smart_manager.prodAttributeActualValues[key].val : '';

				if( attrType == 'text' ) {
					if( obj.hasOwnProperty('value') ) {
						let values = Object.values(obj.value);
						if( values.length > 0 ) {
							attrValue = values.reduce(( acc, cur ) => { return acc + cur.trim() + ' | '; });
						}
					}
				}

			} else if (isTaxonomy == 0) {
				attrLabel = ( obj.hasOwnProperty('name') ) ? obj.name : '';
				attrType = 'text';
				attrValue = ( obj.hasOwnProperty('value') ) ? obj.value : '';
			}

			attrSelectedList += window.smart_manager.generateAttributeCardHtml({
				attrKey: key,
				attrLabel: attrLabel,
				attrValue: attrValue,
				attrType: attrType,
				isTaxonomy: isTaxonomy,
				visibilityChecked: (obj.hasOwnProperty('is_visible') && obj.is_visible == 1) ? 'checked' : '',
				variationChecked: (obj.hasOwnProperty('is_variation') && obj.is_variation == 1) ? 'checked' : '',
				position: obj.hasOwnProperty('position') ? obj.position : '',
				selectedValues: obj.value || null
			});
			window.smart_manager.prodAttrDisplayIndex++;
		});
	}

	Object.entries(params.colObj.values).forEach(([key, value]) => {
		let disabled = ( selectedAttributes.indexOf( key ) != -1 ) ? 'disabled' : '';
	  	attributeList += '<option value="'+key+'" '+ disabled +' >'+value.lbl+'</option>';
	});

	dlgContent += '<div id="edit_product_attributes" class="flex flex-col">';
	dlgContent += '<input type="hidden" name="isVariation" value="'+ ( ( isVariation ) ? 1 : 0 ) +'">';
	
	// Attributes list container
	dlgContent += '<div id="sm_attributes_list" class="flex flex-col">';
	dlgContent += attrSelectedList;
	dlgContent += '</div>';
	
	// Toolbar - Add attribute
	dlgContent += '<div id="edit_attributes_toolbar" class="flex items-center justify-end gap-3 pt-4 border-t border-sm-base-border">';
	dlgContent += '<select id="edit_attributes_taxonomy_list" class="py-2 text-sm border border-sm-base-input rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-sm-base-primary focus:border-sm-base-primary cursor-pointer">'+attributeList+'</select>';
	dlgContent += '<button type="button" class="px-4 py-2 text-sm font-medium text-sm-base-primary-foreground bg-sm-base-primary rounded-md hover:bg-[#5850d6] transition-colors cursor-pointer" id="edit_attributes_add">'+_x('Add', 'add attribute button for WooCommerce products', 'smart-manager-for-wp-e-commerce')+'</button>';
	dlgContent += '</div>';
	dlgContent += '</div>';

		let initializeAttributesSelect2 = function() {
			jQuery("select.multiselect").select2({
				tags: true,
				containerCssClass: 'sm-attribute-modal-select2-container',
				dropdownCssClass: 'sm-attribute-modal-select2-dropdown',
				width: '15rem',
			});

			//Code for select all and none attributes
			jQuery(document)
			.off('click', 'button.select_all_attributes').on('click', 'button.select_all_attributes', function(){
				jQuery(this).closest('.sm-attribute-card').find('select.multiselect option').attr("selected","selected");
				jQuery(this).closest('.sm-attribute-card').find('select.multiselect').trigger('change.select2');
				return false;
			})

			.off('click', 'button.select_no_attributes').on('click', 'button.select_no_attributes', function(){
				jQuery(this).closest('.sm-attribute-card').find('select.multiselect option').removeAttr("selected");
				jQuery(this).closest('.sm-attribute-card').find('select.multiselect').trigger('change.select2');
				return false;
			});
		}

		window.smart_manager.modal = {
			title: _x('Attribute', 'modal title', 'smart-manager-for-wp-e-commerce'),
			content: dlgContent,
			autoHide: false,
			width: 'max-w-xl',
			cta: {
				title: _x('Ok', 'button', 'smart-manager-for-wp-e-commerce'),
				callback: function() {
					if( typeof window.smart_manager.prodAttributeInlineEdit === "function" ) {
						window.smart_manager.prodAttributeInlineEdit(params);
					}
				}
			},
			onCreate: initializeAttributesSelect2,
			onUpdate: initializeAttributesSelect2
		}
		window.smart_manager.showModal()
})

.off('click', '#edit_attributes_add').on('click', '#edit_attributes_add', function(){
	let taxonomySelected = jQuery("#edit_attributes_taxonomy_list").val(),
		attrType = 'text',
		attrVal = '',
		isTaxonomy = 0,
		attrLabel = '';

	//Code to reset the taxonomy list
	jQuery('#edit_attributes_taxonomy_list').find('option[value="custom"]').prop('selected', true);
	jQuery('#edit_attributes_taxonomy_list').find('option[value="'+ taxonomySelected +'"]').prop('disabled', true);

	if(taxonomySelected && ("custom" !== taxonomySelected)){
		const attrData = window.smart_manager.prodAttributeActualValues?.[taxonomySelected] || {};
		attrType = attrData.type || '';
		attrVal = attrData.val || '';
		attrLabel = attrData.lbl || '';
		isTaxonomy = 1;
	}

	const newAttribute = window.smart_manager.generateAttributeCardHtml({
		attrKey: taxonomySelected,
		attrLabel: attrLabel,
		attrValue: attrVal,
		attrType: attrType,
		isTaxonomy: isTaxonomy,
		visibilityChecked: '',
		variationChecked: '',
		position: window.smart_manager.prodAttrDisplayIndex,
		selectedValues: null
	});

	jQuery('#sm_attributes_list').append(newAttribute);
	jQuery("select.multiselect").select2({
		tags: true,
		containerCssClass: 'sm-attribute-modal-select2-container',
		dropdownCssClass: 'sm-attribute-modal-select2-dropdown',
		width: '15rem'
	});

	window.smart_manager.prodAttrDisplayIndex++;
})
// Code for handling the export records functionality
.off( 'click', "#sm_navbar_export_btn .sm_beta_dropdown_content a").on( 'click', "#sm_navbar_export_btn .sm_beta_dropdown_content a", function(e){
	if(window.smart_manager.dashboardKey === 'product'){
		window.smart_manager.stockCols = ['sm_export_selected_stock_cols', 'sm_export_entire_store_stock_cols'];
		window.smart_manager.visibleCols = ['sm_export_selected_visible_cols', 'sm_export_entire_store_visible_cols'];
		if(window.smart_manager.sm_beta_pro == 0){
			window.smart_manager.recordSelectNotification= (jQuery(this).attr('id') === 'sm_export_selected_stock_cols') ? true : false;
			window.smart_manager.exportCSVActions = window.smart_manager.stockCols;
		}else{
			window.smart_manager.exportCSVActions = window.smart_manager.stockCols.concat(window.smart_manager.visibleCols);
		}
	}
})
