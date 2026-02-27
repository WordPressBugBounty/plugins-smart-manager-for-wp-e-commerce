/**
 * Smart Manager JS class
 * Initialize and load data in grid
 * Public interface
 **/
var { __, _x, _n, _nx} = wp.i18n;
if(typeof sprintf === 'undefined' && wp.i18n.sprintf) { //Fix added for client
    var sprintf = wp.i18n.sprintf;
}
(function (window) {
    function SmartManager() {
		SaCommonManager.call(this);
		this.pluginKey = 'smart_manager';
		this.pluginSlug = 'sm';
	}
	SmartManager.prototype = Object.create(SaCommonManager.prototype);
    SmartManager.prototype.constructor = SmartManager;
	window.smart_manager = new SmartManager();
    SmartManager.prototype.init = function () {
		SaCommonManager.prototype.init.call(this); // Reuse base init
		this.commonManagerAjaxUrl = (ajaxurl.indexOf('?') !== -1)
			? ajaxurl + '&action=sa_sm_manager_include_file'
			: ajaxurl + '?action=sa_sm_manager_include_file';
		this.lang = sm_beta_params?.lang;
		this.ajaxParams = {}
		this.pluginKey = 'smart_manager';
		this.pluginSlug = 'sm';
		this.firstLoad = true
		this.currentDashboardModel='';
		this.dashboardKey = '';
		this.dashboardName = '';
		this.dashboard_select_options= '';
		this.saCommonNonce= '';
		this.column_names= new Array();
		this.advancedSearchQuery= new Array();
		this.simpleSearchText = '';
		this.advancedSearchRuleCount = 0;
		this.post_data_params = '';
		this.month_names_short = '';
		this.dashboardStates = {};
		this.current_selected_dashboard = '';
		this.currentDashboardData = [];
		this.currentVisibleColumns = new Array('');
		this.editedData = {};
		this.editedCellIds = [];
		this.selectedRows = [];
		this.duplicateStore = false;
		this.batch_update_action_options_default = '';
		this.batch_update_actions = {};
		this.sm_beta_smart_date_filter = '';
		this.addRecords_count = 0;
		this.defaultColumnsAddRow = new Array('posts_post_status', 'posts_post_title', 'posts_post_content');
		this.columnsVisibilityUsed = false; // flag for handling column visibility
		this.totalRecords = 0;
		this.displayTotalRecords = 0;
		this.loadedTotalRecords = 0;
		this.hotPlugin = {}; //object containing all Handsontable plugins
		this.gettingData = 0;
		this.searchType = sm_beta_params.search_type;
		this.advancedSearchContent = '';
		this.simpleSearchContent = '';
		this.searchTimeoutId = 0;
		this.columnSort = false;
		this.defaultEditor = true;
		this.currentGetDataParams = {};
		this.modifiedRows = [];
		this.dirtyRowColIds = {};
		this.wpToolsPanelWidth = 0;
		this.kpiData = {};
		this.defaultSortParams = { orderby: 'ID', order: 'DESC', default: true };
		this.isColumnModelUpdated = false
		this.state_apply = false;
		this.skip_default_action = false;
		this.search_count = 0;
		this.page = 1;
		this.multiselect_chkbox_list = '';
		this.limit = sm_beta_params.record_per_page;
		this.sm_dashboards_combo = '', // variable to store the dashboard name;
		this.columnNamesBatchUpdate= new Array(), // array for storing the batch update field;
		this.sm_store_table_model = new Array(), // array for storing store table mode;
		this.lastrow = '1';
		this.lastcell = '1';
		this.grid_width = '750';
		this.grid_height = '600';
		this.sm_qtags_btn_init = 1;
		this.sm_grid_nm = 'sm_editor_grid'; //name of div containing jqgrid
		this.sm_wp_editor_html = ''; //variable for storing the html of the wp editor
		this.sm_last_edited_row_id = '';
		this.sm_last_edited_col = '';
		this.colModelSearch = {};
		this.advancedSearchRoute = "advancedSearch";
		this.bulkEditRoute = "bulkEdit";
		this.columnManagerRoute = "columnManager";
		this.settingsRoute = "settings";
		this.privilegeSettingsRoute = "privilegeSettings";
		this.eligibleDashboardSavedSearch = '';
		this.loadingDashboardForsavedSearch = false;
		// Additional operators for advanced search for 'text' type cols
		this.proAdvancedSearchOperators = {
			'startsWith': _x('starts with', "select options - operator for 'text' data type fields", 'smart-manager-for-wp-e-commerce'),
			'endsWith': _x('ends with', "select options - operator for 'text' data type fields", 'smart-manager-for-wp-e-commerce'),
			'anyOf': _x('any of', "select options - operator for 'text' data type fields", 'smart-manager-for-wp-e-commerce'),
			'notStartsWith': _x('not starts with', "select options - operator for 'text' data type fields", 'smart-manager-for-wp-e-commerce'),
			'notEndsWith': _x('not ends with', "select options - operator for 'text' data type fields", 'smart-manager-for-wp-e-commerce'),
			'notAnyOf': _x('not any of', "select options - operator for 'text' data type fields", 'smart-manager-for-wp-e-commerce')
		}
		if(this.possibleOperators.text){
			this.possibleOperators.text = {...this.possibleOperators.text, ...this.proAdvancedSearchOperators}
		}
		this.savedSearch = []
		this.savedBulkEditConditions = []
		this.batch_background_process = sm_beta_params.batch_background_process;
		this.sm_success_msg = sm_beta_params.success_msg;
		this.background_process_name = sm_beta_params.background_process_name;
		this.sm_updated_successful = parseInt(sm_beta_params.updated_successful);
		this.sm_updated_msg = sm_beta_params.updated_msg;
		this.sm_dashboards = sm_beta_params.sm_dashboards;
		this.sm_views = (sm_beta_params.hasOwnProperty('sm_views')) ? JSON.parse(sm_beta_params.sm_views) : {};
		this.ownedViews = (sm_beta_params.hasOwnProperty('sm_owned_views')) ? JSON.parse(sm_beta_params.sm_owned_views) : [];
		this.publicViews = (sm_beta_params.hasOwnProperty('sm_public_views')) ? JSON.parse(sm_beta_params.sm_public_views) : []
		this.savedSearches = (sm_beta_params.hasOwnProperty('sm_saved_searches')) ? JSON.parse(sm_beta_params.sm_saved_searches) : []
		this.viewPostTypes = (sm_beta_params.hasOwnProperty('sm_view_post_types')) ? JSON.parse(sm_beta_params.sm_view_post_types) : {}
		this.recentDashboards = (sm_beta_params.hasOwnProperty('recent_dashboards')) ? JSON.parse(sm_beta_params.recent_dashboards) : [];
		this.recentViews = (sm_beta_params.hasOwnProperty('recent_views')) ? JSON.parse(sm_beta_params.recent_views) : [];
		this.recentDashboardType = (sm_beta_params.hasOwnProperty('recent_dashboard_type')) ? sm_beta_params.recent_dashboard_type : 'post_type';
		this.sm_dashboards_public = sm_beta_params.sm_dashboards_public;
		this.taxonomyDashboards = (sm_beta_params.hasOwnProperty('taxonomy_dashboards')) ? JSON.parse(sm_beta_params.taxonomy_dashboards) : {};
		this.allTaxonomyDashboards = (sm_beta_params.hasOwnProperty('all_taxonomy_dashboards')) ? JSON.parse(sm_beta_params.all_taxonomy_dashboards) : {};
		this.recentTaxonomyDashboards = (sm_beta_params.hasOwnProperty('recent_taxonomy_dashboards')) ? JSON.parse(sm_beta_params.recent_taxonomy_dashboards) : [];
		this.recentSimpleSearches = (sm_beta_params.hasOwnProperty('recent_simple_searches')) ? JSON.parse(sm_beta_params.recent_simple_searches) : {};
		this.sm_lite_dashboards = sm_beta_params.lite_dashboards;
		this.sm_admin_email = sm_beta_params.sm_admin_email;
		this.sm_deleted_successful = parseInt(sm_beta_params.deleted_successful);
		this.trashEnabled = sm_beta_params.trashEnabled;
		this.clearSearchOnSwitch = true;
		this.sm_is_woo30 = sm_beta_params.SM_IS_WOO30;
		this.sm_id_woo22 = sm_beta_params.SM_IS_WOO22;
		this.sm_is_woo21 = sm_beta_params.SM_IS_WOO21;
		this.sm_beta_pro = sm_beta_params.SM_BETA_PRO;
		this.smAppAdminURL = sm_beta_params.SM_APP_ADMIN_URL;
		this.wooPriceDecimalPlaces = ( typeof sm_beta_params.woo_price_decimal_places != 'undefined' ) ? sm_beta_params.woo_price_decimal_places : 2;
		this.wooPriceDecimalSeparator = ( typeof sm_beta_params.woo_price_decimal_separator != 'undefined' ) ? sm_beta_params.woo_price_decimal_separator : '.';
		this.wpDbPrefix = sm_beta_params.wpdb_prefix;
		this.backgroundProcessRunningMessage = sm_beta_params.background_process_running_message
		this.trashAndDeletePermanently = sm_beta_params.trashAndDeletePermanently
		this.window_width = jQuery(window).width();
		this.window_height = jQuery(window).height();
		this.pricingPageURL = ((this.smAppAdminURL) ? this.smAppAdminURL : location.href) + '-pricing';
		this.month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		this.forceCollapseAdminMenu = (sm_beta_params.hasOwnProperty('forceCollapseAdminMenu')) ? parseInt(sm_beta_params.forceCollapseAdminMenu) : 0
		this.defaultImagePlaceholder = (sm_beta_params.hasOwnProperty('defaultImagePlaceholder')) ? sm_beta_params.defaultImagePlaceholder : ''
		this.rowHeight = (sm_beta_params.hasOwnProperty('rowHeight')) ? sm_beta_params.rowHeight : 50;
		this.showTasksTitleModal = (sm_beta_params.hasOwnProperty('showTasksTitleModal')) ? parseInt(sm_beta_params.showTasksTitleModal) : 0
		this.useNumberFieldForNumericCols = (sm_beta_params.hasOwnProperty('useNumberFieldForNumericCols')) ? parseInt(sm_beta_params.useNumberFieldForNumericCols) : 0
		this.isTasksViewActive = false // State variable to track if tasks view is active
		this.isViewContainSearchParams = false
		this.WCProductImportURL = (sm_beta_params.hasOwnProperty('WCProductImportURL')) ? sm_beta_params.WCProductImportURL : ''
		this.allSettings = (sm_beta_params.hasOwnProperty('allSettings')) ? sm_beta_params.allSettings : {}
		this.useDatePickerForDateTimeOrDateCols = (sm_beta_params.hasOwnProperty('useDatePickerForDateTimeOrDateCols')) ? parseInt(sm_beta_params.useDatePickerForDateTimeOrDateCols) : 0
		this.select2RulesDropdownParent = '#sa_manager_main aside';
		//Code for setting the default dashboard
		if( typeof this.sm_dashboards != 'undefined' && this.sm_dashboards != '' ) {
			this.sm_dashboards_combo = this.sm_dashboards = JSON.parse(this.sm_dashboards);
			this.sm_lite_dashboards = JSON.parse(this.sm_lite_dashboards);
			let defaultDashboardslug = (Array.isArray(this.recentDashboards) && this.recentDashboards.length > 0) ? this.recentDashboards[0] : '';
			this.dashboardName = (defaultDashboardslug) ? this.sm_dashboards[defaultDashboardslug] : ''
			if(this.sm_beta_pro == 1){
				if((this.recentDashboardType == 'view' || defaultDashboardslug == '') && this.recentViews.length > 0){
					defaultDashboardslug = (this.viewPostTypes.hasOwnProperty(this.recentViews[0])) ? this.recentViews[0] : '';
					this.dashboardName = (this.sm_views[defaultDashboardslug]) ? this.sm_views[defaultDashboardslug] : this.dashboardName
				}

				if((this.recentDashboardType == 'taxonomy' || defaultDashboardslug == '') && this.recentTaxonomyDashboards.length > 0){
					defaultDashboardslug = (this.recentTaxonomyDashboards[0]) ? this.recentTaxonomyDashboards[0] : defaultDashboardslug;
					this.dashboardName = (this.taxonomyDashboards[defaultDashboardslug]) ? this.taxonomyDashboards[defaultDashboardslug] : this.dashboardName
				}
			}
			this.current_selected_dashboard = defaultDashboardslug;
			this.dashboardKey = defaultDashboardslug;
			let savedSearch = (window.smart_manager && typeof window.smart_manager.findSavedSearchBySlug === "function") ? window.smart_manager.findSavedSearchBySlug(defaultDashboardslug) : false;
			if((parseInt(window.smart_manager.sm_beta_pro) === 1) && (savedSearch) && (savedSearch.hasOwnProperty('parent_post_type')) && (savedSearch.hasOwnProperty('params')) && (savedSearch.hasOwnProperty('title'))){
				this.current_selected_dashboard = savedSearch?.slug || '';
				this.dashboardKey = savedSearch?.parent_post_type || '';
				window.smart_manager.loadingDashboardForsavedSearch = true;
				window.smart_manager.advancedSearchQuery = savedSearch?.params?.search_params?.params || [];
				window.smart_manager.savedSearchParams = savedSearch?.params?.search_params || {};
				window.smart_manager.savedSearchDashboardKey = savedSearch?.parent_post_type || '';
				let child = window.smart_manager.findSelect2ParentOrChildByText(savedSearch.parent_post_type,true);
				window.smart_manager.savedSearchDashboardName = child?.childText || '';
			}
			this.saCommonNonce = this.sm_dashboards['sm_nonce'];
			delete this.sm_dashboards['sm_nonce'];
			this.sm_is_woo79 = (sm_beta_params.hasOwnProperty('SM_IS_WOO79')) ? sm_beta_params.SM_IS_WOO79 : '';
			this.modalVals = {}
			this.savedSearchConds = {}
			this.colEditDisableMessage = (sm_beta_params.colEditDisableMessage) ? sm_beta_params.colEditDisableMessage : []
			this.orderStatuses = sm_beta_params?.orderStatuses || []
			this.scheduledExportActionAdminUrl = sm_beta_params?.scheduled_export_actions_admin_url || ''
			this.isSubscriptionPluginActive = sm_beta_params?.isSubscriptionPluginActive || false
			this.subscriptionsExist = sm_beta_params?.subscriptionsExist || false
			this.subscriptionsAcceptManualRenewals = sm_beta_params?.subscriptionsAcceptManualRenewals || false
			this.isStripeGatewayActive = sm_beta_params?.isStripeGatewayActive || false
		}
		window.smart_manager.setDashboardDisplayName();
		this.currentPageNumber = 1; // Track current page for pagination
		this.totalPages = 1; // Track total pages for pagination
		this.container = document.getElementById('sm_editor_grid');
		this.body_font_size = jQuery("body").css('font-size');
		this.body_font_family = jQuery("body").css('font-family');
		this.editedAttribueSlugs = '';
		this.excludedEditedFieldKeys = [];
		this.processName = '';
		this.processContent = '';
		this.updatedTitle = '';
		this.updatedEditedData = {};
		this.selectedAllTasks = false;
		this.exportStore = '';
		this.isRefreshingLoadedPage = false;
		this.editedColumnTitles = {};
		this.isViewAuthor = false;
		this.searchSwitchClicked = false;
		this.columnsToBeExported = 'visible';
		this.recordSelectNotification = (this.sm_beta_pro == 1) ? true: false;
		this.stockCols = [];
		this.visibleCols = [];
		this.exportCSVActions = ['sm_export_selected_records', 'sm_export_entire_store'];
		this.scheduledActionContent = '';
		this.isScheduled = false;
		this.scheduledActionAdminUrl = (sm_beta_params.scheduled_action_admin_url) ? sm_beta_params.scheduled_action_admin_url : '';
		this.scheduledFor = '0000-00-00 00:00:00';
		this.accessPrivilegeSettings = {};
		this.isAdmin = (sm_beta_params.hasOwnProperty('is_admin')) ? sm_beta_params.is_admin : false
		this.sm_manage_scheduled_bulk_edits = '';
		this.taskId = 0;
		this.isCustomView = (window.smart_manager.getViewSlug(window.smart_manager.dashboardName)) ? true : false;
		this.userSwitchingDashboard = false;
		this.pluginSlug = 'sm';
		this.proConstName = 'SmartManagerPro';
		this.support_link = sm_beta_params?.support_link || '';
		this.review_link = sm_beta_params?.review_link || '';
		this.pluginParams = sm_beta_params;
		//Function to set all the states on unload
		window.onbeforeunload = function (evt) {
			if ( typeof (window.smart_manager.updateState) !== "undefined" && typeof (window.smart_manager.updateState) === "function" ) {
				window.smart_manager.updateState({'async': false}); //refreshing the dashboard states
			}
		}
		if ( !jQuery(document.body).hasClass('folded') && window.smart_manager.sm_beta_pro == 1 && window.smart_manager.forceCollapseAdminMenu == 1) {
			jQuery(document.body).addClass('folded');
		}
		let contentwidth = jQuery('#wpbody-content').width() - 8,
			contentheight = 910;
		let grid_height = contentheight - ( contentheight * 0.20 );
		window.smart_manager.grid_width = contentwidth;
		let heightDeduction = (window.smart_manager.sm_beta_pro == 1) ? 200 : 400;
		window.smart_manager.grid_height = ( grid_height < document.body.clientHeight - heightDeduction ) ? document.body.clientHeight - heightDeduction : grid_height;
		jQuery('#sm_editor_grid').trigger( 'smart_manager_init' ); //custom trigger
		window.smart_manager.loadDashboard();
		window.smart_manager.event_handler();
		window.smart_manager.loadNavBar();
		window.smart_manager.exportButtonHtml();
		//Code for setting rowHeight CSS variable
		let r = document.querySelector(':root');
		if(r){
			let rowHeightValue = String(window.smart_manager.rowHeight).includes('px') ? window.smart_manager.rowHeight : window.smart_manager.rowHeight+'px';
			r.style.setProperty('--row-height', rowHeightValue);
		}
    };

	SmartManager.prototype.loadDashboard = function() {
		jQuery('#sm_editor_grid').trigger( 'smart_manager_pre_loadDashboard' ); //custom trigger

		window.smart_manager.page = 1;

		if( typeof(window.smart_manager.currentDashboardModel) == 'undefined' || window.smart_manager.currentDashboardModel == '' ) {
			window.smart_manager.column_names = new Array('');
			window.smart_manager.columnNamesBatchUpdate= new Array();

			var sm_dashboard_valid = 0;
			if( window.smart_manager.sm_beta_pro == 0 ) {
				sm_dashboard_valid = 0;
				if( window.smart_manager.sm_lite_dashboards.indexOf(window.smart_manager.dashboardKey) >= 0 ) {
					sm_dashboard_valid = 1;
				}
			} else {
				sm_dashboard_valid = 1;
			}

			if(typeof window.smart_manager.hot == 'undefined'){
				window.smart_manager.loadGrid();
			}

			if( sm_dashboard_valid == 1 ) {
				window.smart_manager.getDashboardModel();
				if(window.smart_manager.isCustomView === false && ( ! window.location.search.includes('show_edit_history'))){
					window.smart_manager.getData();
				}
			} else {
				jQuery("#sm_dashboard_select").val(window.smart_manager.current_selected_dashboard);
				window.smart_manager.notification = {message: sprintf(
					/* translators: %1$s: dashboard display name %2$s: success message %3$s: pricing page link */
					_x('For managing %1$s, %2$s %3$s version', 'modal content', 'smart-manager-for-wp-e-commerce'), window.smart_manager.dashboardDisplayName, window.smart_manager.sm_success_msg, '<a href="' + window.smart_manager.pricingPageURL + '" target="_blank">'+_x('Pro', 'modal content', 'smart-manager-for-wp-e-commerce')+'</a>'),hideDelay: window.smart_manager.notificationHideDelayInMs}
				window.smart_manager.showNotification()
			}
		} else {
			window.smart_manager.getData();
		}
	}

	SmartManager.prototype.getDashboardModel = function () {
		SaCommonManager.prototype.getDashboardModel.call(this, false);
		if(!this.ajaxParams || (typeof this.ajaxParams !== 'object')){
			return;
		}
		// Ajax request to get the dashboard model.
		this.ajaxParams.data.is_public = (window.smart_manager.sm_dashboards_public.indexOf(window.smart_manager.dashboardKey) != -1) ? 1 : 0
		this.ajaxParams.active_module_title = window.smart_manager.dashboardName
		this.ajaxParams.hideLoader = false
		// Code for passing extra param for taxonomy & view handling.
		if (window.smart_manager.sm_beta_pro == 1) {
			let viewSlug = window.smart_manager.getViewSlug(window.smart_manager.dashboardName);
			this.ajaxParams.data['is_view'] = 0;
			if (viewSlug) {
				this.ajaxParams.data['is_view'] = 1;
				this.ajaxParams.data['active_view'] = viewSlug;
				this.ajaxParams.data['active_module'] = (window.smart_manager.viewPostTypes.hasOwnProperty(viewSlug)) ? window.smart_manager.viewPostTypes[viewSlug] : window.smart_manager.dashboardKey;
				window.smart_manager.refreshIsViewAuthor(viewSlug);
			}
			// Flag for handling taxonomy dashboards
			this.ajaxParams.data['is_taxonomy'] = window.smart_manager.isTaxonomyDashboard();
			// Code for passing extra param for handling tasks
			this.ajaxParams.data = ("undefined" !== typeof (window.smart_manager.addTasksParams) && "function" === typeof (window.smart_manager.addTasksParams) && 1 == window.smart_manager.sm_beta_pro) ? window.smart_manager.addTasksParams(this.ajaxParams.data) : this.ajaxParams.data;
		}
		this.sendRequest(this.ajaxParams, SaCommonManager.prototype.setDashboardModel.bind(this));
	}

	SmartManager.prototype.sendRequest = function (params, callback, callbackParams) {
		if(typeof params.showLoader == 'undefined' || (typeof params.showLoader != 'undefined' && params.showLoader !== false)){
			this.showLoader();
		}
		if(window.smart_manager.sm_beta_pro == 1){
			// Flag for handling taxonomy dashboards
			params.data['is_taxonomy'] = window.smart_manager.isTaxonomyDashboard();
		}
		SaCommonManager.prototype.sendRequest.call(this, params, callback, callbackParams);
	}

	SmartManager.prototype.formatGridColumns = function () {
		if (Array.isArray(window.smart_manager.currentVisibleColumns) && window.smart_manager.currentVisibleColumns.length > 0) {
			window.smart_manager.currentVisibleColumns.map((c, i) => {
				let colWidth = c.width || 0;
				let header_text = window.smart_manager.column_names[i],
					font = '30px Arial';

				let newWidth = window.smart_manager.getTextWidth(header_text, font);

				if (newWidth > colWidth && !c.width) {
					c.width = (newWidth < 250) ? newWidth : 250;
				}
				c.width = Math.round(parseInt(c.width))
				window.smart_manager.currentVisibleColumns[i] = c
			})
			
			// Add action column at the end
			window.smart_manager.addActionColumn();
		}
	}

	// Add action column to the grid
	SmartManager.prototype.addActionColumn = function() {
		// Check if action column already exists
		const lastCol = window.smart_manager.currentVisibleColumns[window.smart_manager.currentVisibleColumns.length - 1];
		if (lastCol && lastCol.data === 'sm_action_column') {
			return; // Already added
		}
		
		// Determine width based on view mode - wider for tasks/history view
		const isTasksView = window.smart_manager.isTasksViewActive === true || window.location.search.includes('show_edit_history');
		const actionColWidth = isTasksView ? 130 : 80;
		
		// Add to columns array
		window.smart_manager.currentVisibleColumns.push({
			data: 'sm_action_column',
			type: 'sm.action',
			readOnly: true,
			width: actionColWidth,
			className: 'sm-action-column-cell',
			disableVisualSelection: true,
			skipColumnOnPaste: true
		});
		// Add header with column manager icon (will be rendered specially)
		window.smart_manager.column_names.push('sm_action_header');
	}

	SmartManager.prototype.childSetDashboardModel = function (response) {
		if (typeof response != 'undefined' && response != '') {
			window.smart_manager.sm_store_table_model = response.tables;
			//Code for rendering the columns in grid
			window.smart_manager.formatGridColumns();
			if (window.smart_manager.hotPlugin.manualColumnResizePlugin) {
				window.smart_manager.hotPlugin.manualColumnResizePlugin.manualColumnWidths = []
			}
			window.smart_manager.hot.updateSettings({
				data: window.smart_manager.currentDashboardData,
				columns: window.smart_manager.currentVisibleColumns,
				colHeaders: window.smart_manager.column_names,
				forceRender: window.smart_manager.firstLoad
			})
			//Code for handling sort state management
			if (window.smart_manager.currentDashboardModel.hasOwnProperty('sort_params')) {
				if (window.smart_manager.currentDashboardModel.sort_params) {
					if (window.smart_manager.currentDashboardModel.sort_params.hasOwnProperty('default')) {
						window.smart_manager.hotPlugin.columnSortPlugin.sort();
					} else {
						if (window.smart_manager.currentVisibleColumns.length > 0) {
							for (let index in window.smart_manager.currentVisibleColumns) {
								if (window.smart_manager.currentVisibleColumns[index].src == window.smart_manager.currentDashboardModel.sort_params.column) {
									let sort_params = Object.assign({}, window.smart_manager.currentDashboardModel.sort_params);
									sort_params.column = parseInt(index);
									window.smart_manager.hotPlugin.columnSortPlugin.setSortConfig([sort_params]);
									break;
								}
							}
						}
					}
				}
			}
			if (window.smart_manager.firstLoad) {
				window.smart_manager.firstLoad = false
			}
			if (window.smart_manager.sm_beta_pro == 1) {
				if ((window.smart_manager.loadingDashboardForsavedSearch === true) && (window.smart_manager.hasOwnProperty('savedSearchParams') && window.smart_manager.savedSearchParams)) {//set search_params in response when applying saved search to any dashboard.
					response.search_params = window.smart_manager.savedSearchParams;
				}
				jQuery('#sm_custom_views_update, #sm_custom_views_delete').hide();
				let viewSlug = window.smart_manager.getViewSlug(window.smart_manager.dashboardName);
				if (viewSlug) {
					if (window.smart_manager.ownedViews.includes(viewSlug)) {
						jQuery('#sm_custom_views_update, #sm_custom_views_delete').show();
					}
				}
				if (response.hasOwnProperty('search_params')) {
					let searchType = 'simple';
					if (response.search_params.hasOwnProperty('isAdvanceSearch')) {
						if (response.search_params.isAdvanceSearch == 'true') {
							searchType = 'advanced'
						}
					}
					if (response.search_params.hasOwnProperty('params')) {
						if (viewSlug) {
							window.smart_manager.isCustomView = true;
						}
						if (searchType == 'simple') {
							window.smart_manager.simpleSearchText = response.search_params.params;
							window.smart_manager.advancedSearchQuery = new Array();
							jQuery('#search_switch').prop('checked', false);
						} else {
							window.smart_manager.simpleSearchText = '';
							window.smart_manager.advancedSearchQuery = response.search_params.params;
							// code to update the advanced seach rule count
							window.smart_manager.advancedSearchRuleCount = 0;
							if (("undefined" !== typeof (window.smart_manager.updateAdvancedSearchRuleCount)) && ("function" === typeof (window.smart_manager.updateAdvancedSearchRuleCount))) {
								window.smart_manager.updateAdvancedSearchRuleCount();
							}
							jQuery('#search_switch').prop('checked', true);
						}
					}
					window.smart_manager.clearSearchOnSwitch = false;
					window.smart_manager.searchType = (searchType == 'simple') ? 'advanced' : 'simple';
					let el = '#search_switch';
					jQuery(el).attr('switchSearchType', searchType);
					jQuery(el).trigger('change'); //Code to re-draw the search content based on search type
					if (searchType == 'simple') {
						jQuery('#sm_simple_search_box').val(window.smart_manager.simpleSearchText);
					}
					window.smart_manager.clearSearchOnSwitch = true;
				}
			}
			if (window.smart_manager.searchType != 'simple' && !response.hasOwnProperty('search_params')) {
				window.smart_manager.initialize_advanced_search(); //initialize advanced search control
			}
			if ("undefined" !== typeof (window.smart_manager.refreshColumnsTitleAttribute) && "function" === typeof (window.smart_manager.refreshColumnsTitleAttribute)) {
				window.smart_manager.refreshColumnsTitleAttribute();
			}
			window.smart_manager.exportButtonHtml();
			jQuery('#sm_editor_grid').trigger('smart_manager_post_load_grid'); //custom trigger
			if (window.smart_manager.isCustomView === true) {
				window.smart_manager.getData();
			}
			if (window.smart_manager.loadingDashboardForsavedSearch === true) {//reset the variables used to apply saved searches params.
				window.smart_manager.loadingDashboardForsavedSearch = false;
				window.smart_manager.savedSearchParams = {};
				window.smart_manager.savedSearchDashboardKey = '';
				window.smart_manager.savedSearchDashboardName = '';
			}
			window.smart_manager.isCustomView = false;
			window.smart_manager.userSwitchingDashboard = false;
		}
	}

	SmartManager.prototype.convert_to_slug = function (text) {
		return text
			.toLowerCase()
			.replace(/ /g, '-')
			.replace(/[^\w-]+/g, '');
	}

	SmartManager.prototype.convert_to_pretty_text = function (text) {
		return text
			.replace(/_/g, ' ')
			.split(' ')
			.map((s) => s.charAt(0).toUpperCase() + s.substring(1))
			.join(' ');
	}

	SmartManager.prototype.setDashboardDisplayName = function () {
		window.smart_manager.dashboardDisplayName = window.smart_manager.dashboardName;
		let viewSlug = window.smart_manager.getViewSlug(window.smart_manager.dashboardName);
		if (viewSlug) {
			window.smart_manager.dashboardDisplayName = (window.smart_manager.sm_dashboards[window.smart_manager.viewPostTypes[viewSlug]]) ? window.smart_manager.sm_dashboards[window.smart_manager.viewPostTypes[viewSlug]] : 'records';
			window.smart_manager.dashboardDisplayName = (window.smart_manager.dashboardDisplayName === 'records' && window.smart_manager.allTaxonomyDashboards[window.smart_manager.viewPostTypes[viewSlug]]) ? window.smart_manager.allTaxonomyDashboards[window.smart_manager.viewPostTypes[viewSlug]] : window.smart_manager.dashboardDisplayName;
		}
		("undefined" !== typeof (window.smart_manager.changeDashboardDisplayName) && "function" === typeof (window.smart_manager.changeDashboardDisplayName)) ? window.smart_manager.changeDashboardDisplayName(window.smart_manager.dashboardDisplayName) : '';
	}

	// Function to create optgroups for dashboards
	SmartManager.prototype.createOptGroups = function (args = {}) {

		if (Object.keys(args).length == 0) {
			return;
		}

		if (!args.parent || !args.child || !args.label) {
			return
		}

		let parent = (!Array.isArray(args.parent)) ? Object.keys(args.parent) : args.parent,
			child = (!Array.isArray(args.child)) ? Object.keys(args.child) : args.child,
			options = '',
			count = 0;

		// Create the navbarComboboxSelect2 object
		let parentId = args.label.toLowerCase().replace(/\s+/g, '_');
		let dashboardSelect2Item = {
			id: parentId,
			text: args.label,
			children: []
		};
		child.map((item) => {
			let key, label;
			if (typeof item === 'string') {
				key = item;
				label = args['is_recently_accessed'] ? args.parent[key] : args.child[key];
			} else if (typeof item === 'object' && item.slug) {
				key = item.slug;
				label = item.title;
			}
			if (((parent.includes(key) || ((typeof item === 'object'))) && args['is_recently_accessed']) || (!parent.includes(key) && !args['is_recently_accessed']) || args['isParentChildSame']) {
				count++;
				options += `<option value="${key}" ${(((key === window.smart_manager.dashboardKey) && window.smart_manager.loadingDashboardForsavedSearch === false) || ((key === window.smart_manager.current_selected_dashboard) && window.smart_manager.loadingDashboardForsavedSearch === true)) ? "selected" : ""}>${label}</option>`;
				dashboardSelect2Item.children.push({
					id: key,
					text: label,
				});
			}
		});

		if (!window.smart_manager.dashboardSelect2Items || (typeof window.smart_manager.dashboardSelect2Items === 'undefined')) {
			window.smart_manager.dashboardSelect2Items = [];
		}
		//Push combox item only if it not exist
		if (!window.smart_manager.dashboardSelect2Items.some(item => item.id === dashboardSelect2Item.id)) {
			window.smart_manager.dashboardSelect2Items.push(dashboardSelect2Item);
		}

		window.smart_manager.dashboard_select_options += (options != '') ? '<optgroup id="' + parentId + '" label="' + args.label + ' (' + count + ')">' + options + '</optgroup>' : '';
	}

	// Function to initialize navbar dropdown functionality
	SmartManager.prototype.initNavbarDropdown = function () {
		const dropdownBtn = jQuery('#sm-products-dropdown-btn');
		const dropdownPanel = jQuery('#sm-products-dropdown-panel');
		const searchInput = jQuery('#sm-dropdown-search-input');

		// Toggle dropdown on button click
		dropdownBtn.on('click', function (e) {
			e.preventDefault();
			e.stopPropagation();
			dropdownPanel.toggleClass('hidden');
			if (!dropdownPanel.hasClass('hidden')) {
				searchInput.focus();
			}
		});

		// Close dropdown when clicking outside
		jQuery(document).on('click', function (e) {
			if (!jQuery(e.target).closest('#sm-products-dropdown-btn, #sm-products-dropdown-panel').length) {
				dropdownPanel.addClass('hidden');
			}
		});

		// Handle sidebar item clicks (dashboard selection from sidebar)
		jQuery(document).on('click', '.sm-dropdown-sidebar-item', function () {
			const dashboardKey = jQuery(this).data('dashboard-key');
			if (dashboardKey) {
				window.smart_manager.selectDashboard(dashboardKey);
				dropdownPanel.addClass('hidden');
			}
		});

		// Handle content item clicks (dashboard selection from content area)
		jQuery(document).on('click', '.sm-dropdown-content-item', function () {
			const dashboardKey = jQuery(this).data('dashboard-key');
			if (dashboardKey) {
				window.smart_manager.selectDashboard(dashboardKey);
				dropdownPanel.addClass('hidden');
			}
		});

		// Handle search functionality
		searchInput.on('input', function () {
			const searchTerm = jQuery(this).val().toLowerCase();
			
			// Filter content area items
			jQuery('.sm-dropdown-content-item').each(function () {
				const text = jQuery(this).text().toLowerCase();
				if (text.includes(searchTerm)) {
					jQuery(this).css('display', 'flex');
				} else {
					jQuery(this).css('cssText', 'display: none !important');
				}
			});
			
			// Filter sidebar items and hide section header if no items match
			let visibleSidebarCount = 0;
			jQuery('.sm-dropdown-sidebar-item').each(function () {
				const text = jQuery(this).text().toLowerCase();
				if (text.includes(searchTerm)) {
					jQuery(this).show();
					visibleSidebarCount++;
				} else {
					jQuery(this).hide();
				}
			});
			// Hide sidebar section header if no items match
			const sidebarHeader = jQuery('.sm-dropdown-sidebar-item').first().prev();
			if (sidebarHeader.length && sidebarHeader.hasClass('sticky')) {
				if (visibleSidebarCount === 0) {
					sidebarHeader.hide();
				} else {
					sidebarHeader.show();
				}
			}
			
			// Hide content area sections if no items in that section match
			jQuery('#sm-dropdown-content-area > div').each(function () {
				const section = jQuery(this);
				const visibleItems = section.find('.sm-dropdown-content-item').filter(function () {
					return jQuery(this).css('display') !== 'none';
				}).length;
				if (visibleItems === 0) {
					section.addClass('hidden');
				} else {
					section.removeClass('hidden');
				}
			});
		});

		// Handle keyboard navigation
		dropdownPanel.on('keydown', function (e) {
			if (e.key === 'Escape') {
				dropdownPanel.addClass('hidden');
				dropdownBtn.focus();
			}
		});
	}

	// Function to select and load a dashboard
	SmartManager.prototype.selectDashboard = function (dashboardKey) {
		// Update the hidden select element
		jQuery('#sm_dashboard_select').val(dashboardKey).trigger('change');
		
		// Update the button label
		const label = window.smart_manager.sm_dashboards[dashboardKey] || 
			window.smart_manager.taxonomyDashboards[dashboardKey] || 
			window.smart_manager.sm_views[dashboardKey] || 
			dashboardKey;
		jQuery('#sm-current-dashboard-label').text(label);

		// Update active state in dropdown
		jQuery('.sm-dropdown-sidebar-item, .sm-dropdown-content-item').removeClass('sm-active bg-[#6b63f114] text-[#6B63F1]');
		jQuery(`.sm-dropdown-sidebar-item[data-dashboard-key="${dashboardKey}"], .sm-dropdown-content-item[data-dashboard-key="${dashboardKey}"]`).addClass('sm-active bg-[#6b63f114] text-[#6B63F1]');
	}

	// Function to load top right bar on the page
	SmartManager.prototype.loadNavBar = function () {
		//Code for simple & advanced search
		let selected = '',
			switchSearchType = (window.smart_manager.searchType == 'simple') ? _x('Advanced', 'search type', 'smart-manager-for-wp-e-commerce') : _x('Simple', 'search type', 'smart-manager-for-wp-e-commerce');

		window.smart_manager.simpleSearchContent = "<input type='text' class='bg-transparent border-0 focus:shadow-none focus:ring-0 focus:outline-none w-full p-0' id='sm_simple_search_box' autocomplete='off' placeholder='" + _x('Type to search...', 'placeholder', 'smart-manager-for-wp-e-commerce') + "'value='" + window.smart_manager.simpleSearchText + "'>";
		window.smart_manager.advancedSearchContent = '<div id="sm_advanced_search"><div id="sm_advanced_search_content" class="text-sm">' + '</div></div>';

		// Initialize dashboard data structures for the new navbar
		window.smart_manager.navbarDropdownData = {
			frequentPostTypes: [],
			commonTaxonomies: [],
			otherPostTypes: [],
			savedViews: [],
			savedSearches: []
		};

		//Code for dashboards select2
		window.smart_manager.dashboard_select_options = '';
		if (window.smart_manager.sm_beta_pro == 1) {

			let recentDashboards = (!Array.isArray(window.smart_manager.recentDashboards)) ? window.smart_manager.recentDashboards.values() : window.smart_manager.recentDashboards,
				recentTaxonomyDashboards = (!Array.isArray(window.smart_manager.recentTaxonomyDashboards)) ? window.smart_manager.recentTaxonomyDashboards.values() : window.smart_manager.recentTaxonomyDashboards;

			// Code for rendering recently accessed dashboards
			if (recentDashboards.length > 0) {
				window.smart_manager.createOptGroups({
					'parent': window.smart_manager.sm_dashboards,
					'child': recentDashboards,
					'label': _x('Common post types', 'dashboard option groups', 'smart-manager-for-wp-e-commerce'),
					'is_recently_accessed': true
				});
				// Populate navbar dropdown data for frequent post types
				recentDashboards.forEach(key => {
					if (window.smart_manager.sm_dashboards[key]) {
						window.smart_manager.navbarDropdownData.frequentPostTypes.push({
							key: key,
							label: window.smart_manager.sm_dashboards[key]
						});
					}
				});
			}

			// Code for rendering recently accessed taxonomy dashboards
			if (recentTaxonomyDashboards.length > 0) {
				window.smart_manager.createOptGroups({
					'parent': window.smart_manager.taxonomyDashboards,
					'child': recentTaxonomyDashboards,
					'label': _x('Common taxonomies', 'dashboard option groups', 'smart-manager-for-wp-e-commerce'),
					'is_recently_accessed': true
				});
				// Populate navbar dropdown data for common taxonomies
				recentTaxonomyDashboards.forEach(key => {
					if (window.smart_manager.taxonomyDashboards[key]) {
						window.smart_manager.navbarDropdownData.commonTaxonomies.push({
							key: key,
							label: window.smart_manager.taxonomyDashboards[key]
						});
					}
				});
			}

			// Code for rendering recently accessed views
			if (window.smart_manager.recentViews.length > 0 && Object.keys(window.smart_manager.sm_views).length > 0) {
				window.smart_manager.createOptGroups({
					'parent': window.smart_manager.sm_views,
					'child': window.smart_manager.recentViews,
					'label': _x('Recently used views', 'dashboard option groups', 'smart-manager-for-wp-e-commerce'),
					'is_recently_accessed': true
				});
			}

			// Code for rendering all remaining dashboards
			if (Object.keys(window.smart_manager.sm_dashboards).length > 0) {
				window.smart_manager.createOptGroups({
					'parent': recentDashboards,
					'child': window.smart_manager.sm_dashboards,
					'label': _x('Other post types', 'dashboard option groups', 'smart-manager-for-wp-e-commerce'),
					'is_recently_accessed': false
				});
				// Populate navbar dropdown data for other post types
				Object.keys(window.smart_manager.sm_dashboards).forEach(key => {
					if (!recentDashboards.includes(key)) {
						window.smart_manager.navbarDropdownData.otherPostTypes.push({
							key: key,
							label: window.smart_manager.sm_dashboards[key]
						});
					}
				});
			}

			// Code for rendering all remaining taxonomy dashboards
			if (Object.keys(window.smart_manager.taxonomyDashboards).length > 0) {
				window.smart_manager.createOptGroups({
					'parent': recentTaxonomyDashboards,
					'child': window.smart_manager.taxonomyDashboards,
					'label': _x('Other taxonomies', 'dashboard option groups', 'smart-manager-for-wp-e-commerce'),
					'is_recently_accessed': false
				});
				// Populate navbar dropdown data for other taxonomies
				Object.keys(window.smart_manager.taxonomyDashboards).forEach(key => {
					if (!recentTaxonomyDashboards.includes(key)) {
						window.smart_manager.navbarDropdownData.otherTaxonomies = window.smart_manager.navbarDropdownData.otherTaxonomies || [];
						window.smart_manager.navbarDropdownData.otherTaxonomies.push({
							key: key,
							label: window.smart_manager.taxonomyDashboards[key]
						});
					}
				});
			}

			// Code for rendering all remaining views
			if (Object.keys(window.smart_manager.sm_views).length > 0) {
				let otherSavedViews = Object.entries(window.smart_manager.sm_views)
					.filter(([key]) => (!window.smart_manager.recentViews.includes(key) && !window.smart_manager.findSavedSearchBySlug(key)))
					.reduce((acc, [key, value]) => {
						acc[key] = value;
						return acc;
					}, {})
				window.smart_manager.createOptGroups({
					'parent': window.smart_manager.sm_views,
					'child': otherSavedViews,
					'label': _x('Other saved views', 'dashboard option groups', 'smart-manager-for-wp-e-commerce'),
					'is_recently_accessed': true
				});
				// Populate navbar dropdown data for saved views
				Object.keys(window.smart_manager.sm_views).forEach(key => {
					window.smart_manager.navbarDropdownData.savedViews.push({
						key: key,
						label: window.smart_manager.sm_views[key]
					});
				});
			}

			// Code for rendering all Saved searches.
			if (Object.keys(window.smart_manager.savedSearches).length > 0) {
				window.smart_manager.createOptGroups({
					'parent': window.smart_manager.savedSearches,
					'child': window.smart_manager.savedSearches,
					'label': _x('Saved searches', 'saved searches option groups', 'smart-manager-for-wp-e-commerce'),
					'is_recently_accessed': true //show in recent access + show in Saved searches section.
				});
			}

			// Code to change the dashboard key to view post type
			let viewSlug = window.smart_manager.getViewSlug(window.smart_manager.dashboardName);
			if (viewSlug) {
				window.smart_manager.dashboardKey = window.smart_manager.viewPostTypes[viewSlug];
			}
			window.smart_manager.sm_manage_scheduled_bulk_edits = '<div class="sm_beta_dropdown_content">' + '<a href="" class="sm_new_bulk_edits" target="_blank">' +
				_x("New", "button for creating new bulk edit", "smart-manager-for-wp-e-commerce") +
				'</a>' +
				'<a href="' + window.smart_manager.scheduledActionAdminUrl + '" class="sm_scheduled_bulk_edits" target="_blank">' +
				_x("Manage Scheduled edits", "manage button for scheduled bulk edit actions", "smart-manager-for-wp-e-commerce") +
				'</a>' +
				'</div>';
		} else {
			if (Object.keys(window.smart_manager.sm_dashboards).length > 0) {
				window.smart_manager.createOptGroups({
					'parent': window.smart_manager.sm_dashboards,
					'child': window.smart_manager.sm_dashboards,
					'label': _x('All post types', 'dashboard option groups', 'smart-manager-for-wp-e-commerce'),
					'is_recently_accessed': false,
					'isParentChildSame': true
				});
				// Populate navbar dropdown data for all post types (Lite version)
				Object.keys(window.smart_manager.sm_dashboards).forEach(key => {
					window.smart_manager.navbarDropdownData.otherPostTypes.push({
						key: key,
						label: window.smart_manager.sm_dashboards[key]
					});
				});
			}

			if (Object.keys(window.smart_manager.taxonomyDashboards).length > 0) {
				window.smart_manager.createOptGroups({
					'parent': window.smart_manager.taxonomyDashboards,
					'child': window.smart_manager.taxonomyDashboards,
					'label': _x('All taxonomies', 'dashboard option groups', 'smart-manager-for-wp-e-commerce'),
					'is_recently_accessed': false,
					'isParentChildSame': true
				});
				// Populate navbar dropdown data for all taxonomies (Lite version)
				Object.keys(window.smart_manager.taxonomyDashboards).forEach(key => {
					window.smart_manager.navbarDropdownData.commonTaxonomies.push({
						key: key,
						label: window.smart_manager.taxonomyDashboards[key]
					});
				});
			}
		}

		// Get current dashboard label for display
		let currentDashboardLabel = window.smart_manager.sm_dashboards[window.smart_manager.dashboardKey] || 
			window.smart_manager.taxonomyDashboards[window.smart_manager.dashboardKey] || 
			window.smart_manager.dashboardName || 
			_x('Products', 'default dashboard', 'smart-manager-for-wp-e-commerce');

		// Build sidebar items HTML for the dropdown
		let sidebarItemsHtml = '';
		const frequentPostTypes = window.smart_manager.navbarDropdownData.frequentPostTypes;
		if (frequentPostTypes.length > 0) {
			sidebarItemsHtml += `<div class="px-2 py-1.5 text-xs leading-4 font-normal text-sm-base-muted-foreground sticky top-0">${_x('Frequently Used Post Types', 'dashboard option groups', 'smart-manager-for-wp-e-commerce')} (${frequentPostTypes.length})</div>`;
			frequentPostTypes.forEach((item, index) => {
				const isActive = item.key === window.smart_manager.dashboardKey;
				sidebarItemsHtml += `<div class="sm-dropdown-sidebar-item ${isActive ? 'sm-active bg-[#6b63f114] text-[#6B63F1]' : 'text-sm-base-foreground'} p-2 rounded-md text-sm leading-5 font-medium cursor-pointer transition-colors duration-200 hover:bg-[#6b63f114] hover:bg-sm-base-muted" data-dashboard-key="${item.key}">${item.label}</div>`;
			});
		} else {
			// Fallback for lite version - show some post types in sidebar
			const otherPostTypes = window.smart_manager.navbarDropdownData.otherPostTypes.slice(0, 5);
			if (otherPostTypes.length > 0) {
				sidebarItemsHtml += `<div class="px-2 py-1.5 text-xs leading-4 font-normal text-sm-base-muted-foreground sticky top-0">${_x('Post Types', 'dashboard option groups', 'smart-manager-for-wp-e-commerce')} (${otherPostTypes.length})</div>`;
				otherPostTypes.forEach((item) => {
					const isActive = item.key === window.smart_manager.dashboardKey;
					sidebarItemsHtml += `<div class="sm-dropdown-sidebar-item ${isActive ? 'sm-active bg-[#6b63f114] text-[#6B63F1]' : 'text-sm-base-foreground'} p-2 rounded-md text-sm leading-5 font-medium cursor-pointer transition-colors duration-200 hover:bg-[#6b63f114] hover:bg-sm-base-muted" data-dashboard-key="${item.key}">${item.label}</div>`;
				});
			}
		}

		// Build content area items HTML for the dropdown
		let contentItemsHtml = '';
		
		// Common Taxonomies section
		const commonTaxonomies = window.smart_manager.navbarDropdownData.commonTaxonomies;
		if (commonTaxonomies.length > 0) {
			contentItemsHtml += `
				<div class="grid grid-cols-[repeat(2,14.125rem)] gap-y-0.5 gap-x-2 w-full">
					<div class="px-2 py-1.5 pb-0.5 bg-sm-base-background sticky top-0 w-full z-3 col-span-full">
						<p class="text-xs leading-4 text-sm-base-muted-foreground">${_x('Common Taxonomies', 'dashboard option groups', 'smart-manager-for-wp-e-commerce')} (${commonTaxonomies.length})</p>
					</div>
					${commonTaxonomies.map(item => `<div class="sm-dropdown-content-item flex p-2 rounded-md w-56.5 text-sm leading-5 text-sm-base-foreground cursor-pointer transition-colors duration-200 hover:bg-sm-base-muted" data-dashboard-key="${item.key}">${item.label}</div>`).join('')}
				</div>`;
		}

		// Other Post Types section
		const otherPostTypes = window.smart_manager.navbarDropdownData.otherPostTypes;
		if (otherPostTypes.length > 0) {
			contentItemsHtml += `
				<div class="grid grid-cols-[repeat(2,14.125rem)] gap-y-0.5 gap-x-2 w-full">
					<div class="px-2 py-1.5 pb-0.5 bg-sm-base-background sticky top-0 w-full z-3 col-span-full">
						<p class="text-xs leading-4 text-sm-base-muted-foreground">${_x('Other Post Types', 'dashboard option groups', 'smart-manager-for-wp-e-commerce')} (${otherPostTypes.length})</p>
					</div>
					${otherPostTypes.map(item => `<div class="sm-dropdown-content-item flex p-2 rounded-md w-56.5 text-sm leading-5 text-sm-base-foreground cursor-pointer transition-colors duration-200 hover:bg-sm-base-muted" data-dashboard-key="${item.key}">${item.label}</div>`).join('')}
				</div>`;
		}

		// Other Taxonomies section (for PRO version - taxonomies not in recent)
		const otherTaxonomies = window.smart_manager.navbarDropdownData.otherTaxonomies || [];
		if (otherTaxonomies.length > 0) {
			contentItemsHtml += `
				<div class="sm-dropdown-section grid grid-cols-[repeat(2,14.125rem)] gap-y-0.5 gap-x-2 w-full">
					<div class="sm-dropdown-section-header px-2 py-1.5 pb-0.5 bg-sm-base-background sticky top-0 w-full z-3 col-span-full">
						<p class="text-xs leading-4 text-sm-base-muted-foreground">${_x('Other Taxonomies', 'dashboard option groups', 'smart-manager-for-wp-e-commerce')} (${otherTaxonomies.length})</p>
					</div>
					${otherTaxonomies.map(item => `<div class="sm-dropdown-content-item flex p-2 rounded-md w-56.5 text-sm leading-5 text-sm-base-foreground cursor-pointer transition-colors duration-200 hover:bg-sm-base-muted" data-dashboard-key="${item.key}">${item.label}</div>`).join('')}
				</div>`;
		}

		// Saved Views section
		const savedViews = window.smart_manager.navbarDropdownData.savedViews;
		if (savedViews.length > 0) {
			contentItemsHtml += `
				<div class="grid grid-cols-[repeat(2,14.125rem)] gap-y-0.5 gap-x-2 w-full">
					<div class="px-2 py-1.5 pb-0.5 bg-sm-base-background sticky top-0 w-full z-3 col-span-full">
						<p class="text-xs leading-4 text-sm-base-muted-foreground">${_x('Saved Views', 'dashboard option groups', 'smart-manager-for-wp-e-commerce')} (${savedViews.length})</p>
					</div>
					${savedViews.map(item => `<div class="sm-dropdown-content-item flex p-2 rounded-md w-56.5 text-sm leading-5 text-sm-base-foreground cursor-pointer transition-colors duration-200 hover:bg-sm-base-muted" data-dashboard-key="${item.key}">${item.label}</div>`).join('')}
				</div>`;
		}

		// Build the new navbar HTML
		let navBar = `
		<nav class="flex items-center justify-between w-full h-[4.25rem] px-6 py-4 bg-sm-base-background border-b border-sm-base-border gap-0">
			<!-- Logo Section -->
			<div class="flex items-center gap-1 w-82.5 shrink-0">
				<div class="font-medium text-base text-sm-base-muted-foreground leading-6 overflow-hidden text-ellipsis whitespace-nowrap">
					<span class="leading-6 overflow-hidden text-ellipsis m-0">${_x('Smart Manager', 'plugin name', 'smart-manager-for-wp-e-commerce')}</span>
				</div>
				<div class="flex items-center justify-center gap-1 px-2 py-0.5 ${window.smart_manager.sm_beta_pro == 1 ? 'bg-sm-colors-violet-50' : 'bg-gray-100'} rounded-lg shrink-0 font-semibold text-xs ${window.smart_manager.sm_beta_pro == 1 ? 'text-sm-colors-violet-400' : 'text-gray-500'} leading-4 whitespace-nowrap">
					<span class="leading-4">${window.smart_manager.sm_beta_pro == 1 ? _x('PRO', 'version label', 'smart-manager-for-wp-e-commerce') : _x('LITE', 'version label', 'smart-manager-for-wp-e-commerce')}</span>
				</div>
			</div>

			<!-- Search Section -->
			<div class="flex items-center gap-0 flex-1 max-w-[35rem] relative">
				<!-- Dropdown Button - Dashboard Select -->
				<button id="sm-products-dropdown-btn" class="flex items-center justify-center gap-2 h-9 px-2.5 py-2 bg-sm-base-background border border-sm-base-input border-r-0 rounded-l-lg font-medium text-sm text-sm-base-foreground whitespace-nowrap shrink-0 transition-colors duration-200 cursor-pointer hover:bg-gray-50 active:bg-sm-base-background">
					<div class="leading-5" id="sm-current-dashboard-label">${currentDashboardLabel}</div>
					<div class="w-4 h-4 shrink-0 flex items-center justify-center">
						<svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M0.665039 0.664978L4.66504 4.66498L8.66504 0.664978" stroke="var(--color-sm-base-muted-foreground)" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
				</button>

				<!-- Dropdown Panel -->
				<div id="sm-products-dropdown-panel" class="absolute top-full left-0 mt-2 bg-sm-base-background border border-sm-base-border rounded-lg shadow-[0_0.0625rem_0.1875rem_0_rgba(0,0,0,0.1),0_0.0625rem_0.125rem_-0.0625rem_rgba(0,0,0,0.1)] z-999 hidden">
					<div class="flex gap-2 p-2 min-h-[20rem]">
						<!-- Sidebar -->
						<div class="flex flex-col gap-0.5 w-55 shrink-0">
							${sidebarItemsHtml}
						</div>

						<!-- Divider -->
						<div class="w-px bg-sm-base-border self-stretch"></div>

						<!-- Content Area -->
						<div class="flex-1 flex flex-col gap-2 px-1 rounded-lg min-w-117 max-h-88 overflow-y-auto relative sm-custom-scrollbar">
							<!-- Search -->
							<div class="sticky top-0 z-10 bg-sm-base-background">
								<div class="focus-within:border-[#8781f1] flex gap-1 h-9 items-center px-3 py-1 bg-sm-base-background border border-sm-base-input rounded-lg shadow-[0_0.0625rem_0.125rem_0_rgba(0,0,0,0.05)]">
									<svg class="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M14.0001 14L11.1335 11.1333M12.6667 7.33333C12.6667 10.2789 10.2789 12.6667 7.33333 12.6667C4.38781 12.6667 2 10.2789 2 7.33333C2 4.38781 4.38781 2 7.33333 2C10.2789 2 12.6667 4.38781 12.6667 7.33333Z" stroke="var(--color-sm-base-muted-foreground)" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
									</svg>
									<input type="text" id="sm-dropdown-search-input" class="focus:shadow-none flex-1 text-sm leading-5 text-sm-base-foreground border-0 bg-transparent outline-none placeholder:text-sm-base-muted-foreground" placeholder="${_x('Search', 'placeholder', 'smart-manager-for-wp-e-commerce')}" />
								</div>
							</div>

							<!-- Dashboard Categories -->
							<div id="sm-dropdown-content-area">
								${contentItemsHtml}
							</div>
						</div>
					</div>
				</div>

				<!-- Search Input Field -->
				<div id="sm_nav_bar_search" class="border-0 bg-transparent p-0 flex gap-2 items-center flex-1 cursor-pointer">
					<!-- Search Bar -->
					<div class="flex items-center h-9 px-3 py-1 bg-sm-base-muted border border-sm-base-input rounded-r-lg overflow-hidden flex-1 w-full">
						<div class="w-4 h-4 shrink-0 flex items-center justify-center">
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M14.0001 14L11.1335 11.1333M12.6667 7.33333C12.6667 10.2789 10.2789 12.6667 7.33333 12.6667C4.38781 12.6667 2 10.2789 2 7.33333C2 4.38781 4.38781 2 7.33333 2C10.2789 2 12.6667 4.38781 12.6667 7.33333Z" stroke="var(--color-sm-base-muted-foreground)" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</div>
						<div id="sm_search_content_parent" class="flex-1">
							<div id="search_content" class="leading-5 m-0 flex-1 font-normal text-sm text-sm-base-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap border-none bg-transparent outline-none">
								${(window.smart_manager.searchType == 'simple') ? window.smart_manager.simpleSearchContent : window.smart_manager.advancedSearchContent}
							</div>
						</div>
					</div>
				</div>

				<!-- Advanced Search Button -->
				<div id="sm_top_bar_advanced_search" class="flex items-center h-full pl-2 pr-0 py-0 shrink-0">
					${(parseInt(window.smart_manager.sm_beta_pro) === 1 && window.smart_manager.dashboardKey === 'product') ? 
					`<div class="sm-ai-assistant-icon flex items-center justify-center w-9 h-9 px-2.5 py-2 border-none rounded-lg bg-transparent shrink-0 transition-colors duration-200 cursor-pointer hover:bg-gray-100 active:bg-gray-50" title="${_x('AI-powered search', 'AI icon label', 'smart-manager-for-wp-e-commerce')}" context="search">
						<span>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="var(--color-sm-base-muted-foreground)" width="20" height="20">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"></path>
							</svg>
						</span>
					</div>` : ''}
					${window.smart_manager.getAdvancedSearchButtonHtml()}
					<div id="search_switch_container" class="hidden">
						<input type="checkbox" id="search_switch" switchSearchType="${switchSearchType.toLowerCase()}" />
						<label title="${
							/* translators: %s is the search type (Simple or Advanced) */
							sprintf(_x('Switch to %s', 'tooltip', 'smart-manager-for-wp-e-commerce'), switchSearchType)}" for="search_switch">${
							/* translators: %s is the search type (Simple or Advanced) */
							sprintf(_x('%s Search', 'search type', 'smart-manager-for-wp-e-commerce'), switchSearchType)}</label>
					</div>
				</div>
			</div>

			<!-- CTA Section -->
			<div class="flex items-center gap-2 shrink-0 justify-end min-w-[23.75rem]">
				<!-- Import Button -->
				<div id="sm_navbar_import_btn" class="sm-navbar-ghost-btn flex items-center justify-center gap-2 h-9 px-4 py-2 border-none rounded-lg bg-transparent font-medium text-sm text-sm-base-muted-foreground leading-5 whitespace-nowrap shrink-0 transition-colors duration-200 cursor-pointer hover:bg-gray-100 hover:text-sm-base-foreground active:bg-gray-50">
					<div class="w-4 h-4 flex items-center justify-center shrink-0">
						<svg width="15" height="12" viewBox="0 0 15 12" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M7.33171 0.664978V8.66498M7.33171 8.66498L4.66504 5.99831M7.33171 8.66498L9.99837 5.99831M4.66504 1.99831H1.99837C1.64475 1.99831 1.30561 2.13879 1.05556 2.38884C0.805515 2.63888 0.665039 2.97802 0.665039 3.33164V9.99831C0.665039 10.3519 0.805515 10.6911 1.05556 10.9411C1.30561 11.1912 1.64475 11.3316 1.99837 11.3316H12.665C13.0187 11.3316 13.3578 11.1912 13.6078 10.9411C13.8579 10.6911 13.9984 10.3519 13.9984 9.99831V3.33164C13.9984 2.97802 13.8579 2.63888 13.6078 2.38884C13.3578 2.13879 13.0187 1.99831 12.665 1.99831H9.99837" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
					<div class="leading-5">${_x('Import', 'button', 'smart-manager-for-wp-e-commerce')}</div>
				</div>

				<!-- Export Button -->
				<div id="sm_navbar_export_btn" class="sm-navbar-ghost-btn sm_beta_dropdown relative flex items-center justify-center gap-2 h-9 px-4 py-2 border-none rounded-lg bg-transparent font-medium text-sm text-sm-base-muted-foreground leading-5 whitespace-nowrap shrink-0 transition-colors duration-200 cursor-pointer hover:bg-gray-100 hover:text-sm-base-foreground active:bg-gray-50">
					<div class="w-4 h-4 flex items-center justify-center shrink-0">
						${window.smart_manager.getIcons('export','currentColor')}
					</div>
					<div class="leading-5">${_x('Export', 'button', 'smart-manager-for-wp-e-commerce')}</div>
					<div class="sm_beta_dropdown_content top-9 p-1.5 bg-sm-base-background border border-sm-base-border rounded-lg shadow-[0_0.0625rem_0.1875rem_0_rgba(0,0,0,0.1),0_0.0625rem_0.125rem_-0.0625rem_rgba(0,0,0,0.1)]" id="sm_export_csv"></div>
				</div>

				<!-- History Button -->
				<button id="sm_navbar_history_btn" class="flex items-center justify-center w-9 h-9 px-2 py-2 border-none rounded-lg bg-sm-base-muted shrink-0 transition-colors duration-200 cursor-pointer active:bg-gray-200" title="${_x('History', 'tooltip', 'smart-manager-for-wp-e-commerce')}">
					<div class="w-4 h-4 flex items-center justify-center">
						<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M0.665039 6.66498C0.665039 7.85167 1.01693 9.0117 1.67622 9.9984C2.33551 10.9851 3.27258 11.7541 4.36894 12.2083C5.4653 12.6624 6.6717 12.7812 7.83558 12.5497C8.99947 12.3182 10.0686 11.7467 10.9077 10.9076C11.7468 10.0685 12.3182 8.99941 12.5498 7.83552C12.7813 6.67163 12.6624 5.46523 12.2083 4.36888C11.7542 3.27252 10.9852 2.33545 9.99846 1.67616C9.01177 1.01687 7.85173 0.664978 6.66504 0.664978C4.98767 0.671288 3.37769 1.32579 2.17171 2.49164L0.665039 3.99831M0.665039 3.99831V0.664978M0.665039 3.99831H3.99837M6.66504 3.33164V6.66498L9.33171 7.99831" stroke="var(--color-sm-base-muted-foreground)" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
				</button>

				<!-- Documentation Button -->
				<a href="admin.php?page=smart-manager&landing-page=sm-faqs" target="_blank" class="flex items-center justify-center w-9 h-9 px-2 py-2 border-none rounded-lg bg-sm-base-muted shrink-0 transition-colors duration-200 cursor-pointer active:bg-gray-200" title="${_x('Docs', 'tooltip', 'smart-manager-for-wp-e-commerce')}">
					<div class="w-4 h-4 flex items-center justify-center">
						<svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M7.33171 3.33164C7.33171 2.6244 7.05075 1.94612 6.55066 1.44603C6.05056 0.945929 5.37228 0.664978 4.66504 0.664978H0.665039V10.665H5.33171C5.86214 10.665 6.37085 10.8757 6.74592 11.2508C7.12099 11.6258 7.33171 12.1345 7.33171 12.665M7.33171 3.33164V12.665M7.33171 3.33164C7.33171 2.6244 7.61266 1.94612 8.11275 1.44603C8.61285 0.945929 9.29113 0.664978 9.99837 0.664978H13.9984V10.665H9.33171C8.80127 10.665 8.29256 10.8757 7.91749 11.2508C7.54242 11.6258 7.33171 12.1345 7.33171 12.665" stroke="var(--color-sm-base-muted-foreground)" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
				</a>

				<!-- Settings Button -->
				<div id="sm_nav_bar_settings_btn" class="sm-settings-icon sm_beta_dropdown flex items-center justify-center w-9 h-9 px-2 py-2 border-none rounded-lg bg-sm-base-muted shrink-0 transition-colors duration-200 cursor-pointer active:bg-gray-200" title="${_x('Settings', 'tooltip', 'smart-manager-for-wp-e-commerce')}">
					<div class="w-4 h-4 flex items-center justify-center">
						<svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M6.82343 0.664978H6.53009C6.17647 0.664978 5.83733 0.805454 5.58728 1.0555C5.33724 1.30555 5.19676 1.64469 5.19676 1.99831V2.11831C5.19652 2.35213 5.1348 2.58177 5.01778 2.7842C4.90077 2.98663 4.73258 3.15474 4.53009 3.27164L4.24343 3.43831C4.04073 3.55534 3.81081 3.61694 3.57676 3.61694C3.34271 3.61694 3.11278 3.55534 2.91009 3.43831L2.81009 3.38498C2.50414 3.20849 2.14065 3.16061 1.79943 3.25185C1.4582 3.34309 1.16713 3.566 0.990092 3.87164L0.843426 4.12498C0.666934 4.43093 0.619055 4.79442 0.710298 5.13564C0.801541 5.47687 1.02445 5.76794 1.33009 5.94498L1.43009 6.01164C1.63161 6.12799 1.79917 6.29504 1.91613 6.4962C2.03308 6.69736 2.09535 6.92563 2.09676 7.15831V7.49831C2.09769 7.73326 2.03653 7.96428 1.91945 8.16798C1.80238 8.37169 1.63356 8.54084 1.43009 8.65831L1.33009 8.71831C1.02445 8.89535 0.801541 9.18642 0.710298 9.52765C0.619055 9.86887 0.666934 10.2324 0.843426 10.5383L0.990092 10.7916C1.16713 11.0973 1.4582 11.3202 1.79943 11.4114C2.14065 11.5027 2.50414 11.4548 2.81009 11.2783L2.91009 11.225C3.11278 11.108 3.34271 11.0463 3.57676 11.0463C3.81081 11.0463 4.04073 11.108 4.24343 11.225L4.53009 11.3916C4.73258 11.5086 4.90077 11.6767 5.01778 11.8791C5.1348 12.0815 5.19652 12.3112 5.19676 12.545V12.665C5.19676 13.0186 5.33724 13.3577 5.58728 13.6078C5.83733 13.8578 6.17647 13.9983 6.53009 13.9983H6.82343C7.17705 13.9983 7.51619 13.8578 7.76623 13.6078C8.01628 13.3577 8.15676 13.0186 8.15676 12.665V12.545C8.157 12.3112 8.21872 12.0815 8.33573 11.8791C8.45275 11.6767 8.62093 11.5086 8.82343 11.3916L9.11009 11.225C9.31278 11.108 9.54271 11.0463 9.77676 11.0463C10.0108 11.0463 10.2407 11.108 10.4434 11.225L10.5434 11.2783C10.8494 11.4548 11.2129 11.5027 11.5541 11.4114C11.8953 11.3202 12.1864 11.0973 12.3634 10.7916L12.5101 10.5316C12.6866 10.2257 12.7345 9.8622 12.6432 9.52098C12.552 9.17976 12.3291 8.88868 12.0234 8.71164L11.9234 8.65831C11.72 8.54084 11.5511 8.37169 11.4341 8.16798C11.317 7.96428 11.2558 7.73326 11.2568 7.49831V7.16498C11.2558 6.93003 11.317 6.69901 11.4341 6.49531C11.5511 6.2916 11.72 6.12245 11.9234 6.00498L12.0234 5.94498C12.3291 5.76794 12.552 5.47687 12.6432 5.13564C12.7345 4.79442 12.6866 4.43093 12.5101 4.12498L12.3634 3.87164C12.1864 3.566 11.8953 3.34309 11.5541 3.25185C11.2129 3.16061 10.8494 3.20849 10.5434 3.38498L10.4434 3.43831C10.2407 3.55534 10.0108 3.61694 9.77676 3.61694C9.54271 3.61694 9.31278 3.55534 9.11009 3.43831L8.82343 3.27164C8.62093 3.15474 8.45275 2.98663 8.33573 2.7842C8.21872 2.58177 8.157 2.35213 8.15676 2.11831V1.99831C8.15676 1.64469 8.01628 1.30555 7.76623 1.0555C7.51619 0.805454 7.17705 0.664978 6.82343 0.664978Z" stroke="var(--color-sm-base-muted-foreground)" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
							<path d="M6.67676 9.33164C7.78133 9.33164 8.67676 8.43621 8.67676 7.33164C8.67676 6.22707 7.78133 5.33164 6.67676 5.33164C5.57219 5.33164 4.67676 6.22707 4.67676 7.33164C4.67676 8.43621 5.57219 9.33164 6.67676 9.33164Z" stroke="var(--color-sm-base-muted-foreground)" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
				</div>
			</div>
		</nav>
		<!-- Hidden select for backward compatibility -->
		<select id="sm_dashboard_select" class="hidden"></select>
		`;

		// Append the new navbar to the container
		jQuery('#sm_nav_bar').html(navBar);
		
		// Populate the hidden select for backward compatibility
		jQuery('#sm_dashboard_select').empty().append(window.smart_manager.dashboard_select_options);

		// Initialize dropdown functionality
		window.smart_manager.initNavbarDropdown();

		// Build the new header component
		let sm_bottom_bar = "<div id='sm_bottom_bar' class='mt-6' style='width:" + window.smart_manager.grid_width + "px;'>" +
			"<div id='sm_bottom_bar_left' class='sm_beta_left'><div id='sm_beta_display_records' class='sm_beta_select_blue'></div></div>" +
			"<div id='sm_bottom_bar_right' class='sm_beta_right mr-2'>" +
			"</div>" +
			"</div>";

		let sm_msg = jQuery('.sm_design_notice').prop('outerHTML');
		if (sm_msg) {
			jQuery(sm_msg).insertAfter("#sm_nav_bar");
			jQuery('.wrap > .sm_design_notice').show()
		}

		setTimeout(() => {
			jQuery(window.smart_manager.buildHeaderHtml()).insertBefore("#sm_editor_grid");
		}, 500);
		jQuery(sm_bottom_bar).insertAfter("#sm_editor_grid");
		
		// Add floating multi-select action bar
		let sm_floating_action_bar = window.smart_manager.buildFloatingActionBarHtml();
		jQuery(sm_floating_action_bar).insertAfter("#sm_bottom_bar");
		
		// Initialize header functionality
		window.smart_manager.initHeaderControls();

		if ('undefined' !== typeof (window.smart_manager.displayTasks) && 'function' === typeof (window.smart_manager.displayTasks)) {
			window.smart_manager.displayTasks({ hideTasks: true }); // Hide tasks for custom view dashboard
		}
		//Code for Dashboard KPI
		jQuery('#sm_dashboard_kpi').remove();

		if (window.smart_manager.searchType != 'simple') {
			window.smart_manager.initialize_advanced_search(); //initialize advanced search control
		}

		jQuery('#sm-header').trigger('sm_header_loaded');
		window.smart_manager.toggleHeader();
	}

	SmartManager.prototype.initialize_advanced_search = function () {
		if (typeof (window.smart_manager.currentColModel) == 'undefined') {
			return;
		}
		// Update the advanced search button visual state
		window.smart_manager.updateAdvancedSearchButtonState();
	}

	// Function to generate the advanced search button HTML with active state
	SmartManager.prototype.getAdvancedSearchButtonHtml = function () {
		let conditionCount = window.smart_manager.advancedSearchRuleCount || 0;
		if (window.smart_manager.searchType === 'advanced' && window.smart_manager.advancedSearchRuleCount > 0) {
			// Active state: purple border with dot badge indicator
			/* translators: 1: number of filters, 2: pluralized 's' for filters */
			return `<button class="advanced-search-icon relative flex items-center justify-center w-[2.25rem] h-[2.25rem] px-[0.625rem] py-[0.5rem] border border-[#6B63F1] rounded-[0.5rem] bg-transparent shrink-0 transition-colors duration-200 cursor-pointer hover:bg-[#6B63F10A]" title="${sprintf(_x('%1$d filter%2$s applied - Click to edit', 'tooltip', 'smart-manager-for-wp-e-commerce'), conditionCount, (conditionCount > 1 ? 's' : ''))}">
				<div class="w-[1rem] h-[1rem] flex items-center justify-center">
					<svg width="16" height="12" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M12.665 0.664978H0.665039M5.33171 4.66498H0.665039M5.33171 8.66498H0.665039M12.6651 9.33171L11.3984 8.06504M11.9984 6.66498C11.9984 7.76955 11.1029 8.66498 9.99837 8.66498C8.8938 8.66498 7.99837 7.76955 7.99837 6.66498C7.99837 5.56041 8.8938 4.66498 9.99837 4.66498C11.1029 4.66498 11.9984 5.56041 11.9984 6.66498Z" stroke="#6B63F1" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
				<span class="absolute -top-[0.25rem] -right-[0.25rem] flex items-center justify-center min-w-[1rem] h-[1rem] px-[0.25rem] bg-[#6B63F1] text-white text-[0.625rem] font-semibold leading-[1rem] rounded-full">${conditionCount}</span>
			</button>`;
		} else {
			// Inactive state: normal appearance
			return `<button class="advanced-search-icon flex items-center justify-center w-[2.25rem] h-[2.25rem] px-[0.625rem] py-[0.5rem] border-none rounded-[0.5rem] bg-transparent shrink-0 transition-colors duration-200 cursor-pointer hover:bg-gray-100 active:bg-gray-50" title="${_x('Advanced Search', 'tooltip', 'smart-manager-for-wp-e-commerce')}">
				<div class="w-[1rem] h-[1rem] flex items-center justify-center">
					<svg width="16" height="12" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M12.665 0.664978H0.665039M5.33171 4.66498H0.665039M5.33171 8.66498H0.665039M12.6651 9.33171L11.3984 8.06504M11.9984 6.66498C11.9984 7.76955 11.1029 8.66498 9.99837 8.66498C8.8938 8.66498 7.99837 7.76955 7.99837 6.66498C7.99837 5.56041 8.8938 4.66498 9.99837 4.66498C11.1029 4.66498 11.9984 5.56041 11.9984 6.66498Z" stroke="var(--color-sm-base-muted-foreground)" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
			</button>`;
		}
	}

	// Function to update the advanced search button state dynamically
	SmartManager.prototype.updateAdvancedSearchButtonState = function () {
		let newButtonHtml = window.smart_manager.getAdvancedSearchButtonHtml();
		jQuery('#sm_nav_bar_search #search_content').html((window.smart_manager.searchType == 'simple') ? window.smart_manager.simpleSearchContent : window.smart_manager.advancedSearchContent);
		jQuery('#sm_top_bar_advanced_search .advanced-search-icon').replaceWith(newButtonHtml);
	}

	// Common function to show delete confirmation modal
	// options: { recordsText, showTrashOption, isTasksView }
	SmartManager.prototype.showDeleteConfirmModal = function (options = {}) {
		let recordsText = options.recordsText || _x('the selected record', 'modal content', 'smart-manager-for-wp-e-commerce');
		let showTrashOption = (options.hasOwnProperty('showTrashOption')) ? options.showTrashOption : window.smart_manager.trashEnabled;
		let isTasksView = options.isTasksView || false;
		
		let params = {};
		params.title = '<span class="sm-error-icon"><span class="dashicons dashicons-warning" style="vertical-align: text-bottom;"></span>&nbsp;' + _x('Attention!', 'modal title', 'smart-manager-for-wp-e-commerce') + '</span>';
		params.titleIsHtml = true;
		params.btnParams = {};
		params.modalWidth = 'max-w-xl';
		
		// Build inline content - show dropdown only if trash is available and not in tasks view
		if (showTrashOption && !isTasksView) {
			params.content = `
				<div class="flex flex-wrap items-center gap-[0.375rem] text-[0.875rem] leading-[1.5rem] text-sm-base-muted-foreground">
					<span>${_x('Are you sure you want to', 'modal content', 'smart-manager-for-wp-e-commerce')}</span>
					<select id="sm_delete_action_select" class="inline-flex h-[1.75rem] border border-sm-base-input rounded-[0.375rem] bg-sm-base-background text-[0.875rem] text-sm-base-foreground font-medium cursor-pointer">
						<option value="trash" selected>${_x('trash', 'option', 'smart-manager-for-wp-e-commerce')}</option>
						<option value="delete" ${window.smart_manager.sm_beta_pro == 0 ? 'disabled' : ''}>${_x('permanently delete', 'option', 'smart-manager-for-wp-e-commerce')}${window.smart_manager.sm_beta_pro == 0 ? ' (Pro)' : ''}</option>
					</select>
					${recordsText}?
				</div>
			`;
		} else {
			// No trash option - just show permanent delete text
			params.content = `
				<div class="flex flex-wrap items-center gap-[0.375rem] text-[0.875rem] leading-[1.5rem] text-sm-base-muted-foreground">
					<span>${_x('Are you sure you want to', 'modal content', 'smart-manager-for-wp-e-commerce')}</span>
					<strong class="text-red-600">${_x('permanently delete', 'option', 'smart-manager-for-wp-e-commerce')}</strong>
					${recordsText}?
				</div>
			`;
		}
		
		params.btnParams.yesCallbackParams = {};
		
		if (window.smart_manager.sm_beta_pro == 1) {
			params.btnParams.yesCallback = function() {
				let deletePermanently = (!showTrashOption || isTasksView) ? 1 : (jQuery('#sm_delete_action_select').val() === 'delete' ? 1 : 0);
				
				if (typeof (window.smart_manager.deleteAllRecords) !== "undefined" && typeof (window.smart_manager.deleteAllRecords) === "function") {
					window.smart_manager.deleteAllRecords({ 'deletePermanently': deletePermanently });
				}
			};
		} else {
			params.btnParams.yesCallback = function() {
				if (typeof (window.smart_manager.deleteRecords) !== "undefined" && typeof (window.smart_manager.deleteRecords) === "function") {
					window.smart_manager.deleteRecords();
				}
			};
		}
		
		params.btnParams.hideOnYes = (window.smart_manager.sm_beta_pro == 1) ? false : true;
		
		if ((typeof window.smart_manager.dirtyRowColIds !== 'undefined') && Object.getOwnPropertyNames(window.smart_manager.dirtyRowColIds).length > 0) {
			window.smart_manager.confirmUnsavedChanges({ 'yesCallback': window.smart_manager.showConfirmDialog, 'yesCallbackParams': params, 'hideOnYes': false });
		} else if (typeof (window.smart_manager.showConfirmDialog) !== "undefined" && typeof (window.smart_manager.showConfirmDialog) === "function") {
			window.smart_manager.showConfirmDialog(params);
		}
	}

	SmartManager.prototype.getViewSlug = function (title = '') {
		if (!window.smart_manager.sm_views || typeof window.smart_manager.sm_views !== 'object') {
			return undefined;
		}
		return Object.keys(window.smart_manager.sm_views).find(key => window.smart_manager.sm_views[key] === title);
	}
	//Function to check if 'Tasks' is enabled or not
	SmartManager.prototype.isTasksEnabled = function () {
		return (window.smart_manager.isTasksViewActive === true || (window.location.search.includes('show_edit_history'))) ? 1 : 0;
	}
	SmartManager.prototype.displayShowHideColumnSettings = function (isShow = true) {
		jQuery('#sm-edit-custom-view-btn, #sm-delete-custom-view-btn').removeClass((!isShow) ? 'inline-flex' : '!hidden').addClass((!isShow)?'!hidden':'inline-flex');
	}

	SmartManager.prototype.set_data = function (response) {
		if (typeof response != 'undefined' && response != '') {
			let res = {};

			if (response != 'null' && window.smart_manager.isJSON(response)) {
				res = JSON.parse(response);

				if (res && res.hasOwnProperty('meta')) {
					window.smart_manager.isViewContainSearchParams = (res.meta.hasOwnProperty('is_view_contain_search_params') && (true === res.meta.is_view_contain_search_params || 'true' === res.meta.is_view_contain_search_params)) ? true : false;
					//Show feedback modal when Advanced Search show some results.
					if(res.meta.hasOwnProperty('show_feedback') && true === res.meta.show_feedback && parseInt(res.total_count)){
						window.smart_manager.showFeedbackModal();
					}
				}

				window.smart_manager.totalRecords = parseInt(res.total_count);
				window.smart_manager.displayTotalRecords = (res.hasOwnProperty('display_total_count')) ? res.display_total_count : res.total_count;

				// Calculate total pages for pagination
				window.smart_manager.totalPages = Math.ceil(window.smart_manager.displayTotalRecords / window.smart_manager.limit);
				window.smart_manager.currentPageNumber = window.smart_manager.page;

				// For pagination, always replace data instead of appending
				window.smart_manager.currentDashboardData = (window.smart_manager.totalRecords > 0) ? res.items : [];
			} else {
				window.smart_manager.currentDashboardData = [];
			}

			// Load data into grid and handle UI updates consistently for all pages
			if (window.smart_manager.columnSort) {
				window.smart_manager.hot.loadData(window.smart_manager.currentDashboardData);
				window.smart_manager.hot.scrollViewportTo(0, 0);
			} else {

					jQuery('#sm_dashboard_kpi').remove();

					if (res.hasOwnProperty('kpi_data')) {
						window.smart_manager.kpiData = res.kpi_data;
						if (Object.entries(window.smart_manager.kpiData).length > 0) {
							let kpi_html = new Array();

							Object.entries(window.smart_manager.kpiData).forEach(([kpiTitle, kpiObj]) => {
								kpi_html.push('<span class="sm_beta_select_' + ((kpiObj.hasOwnProperty('color') !== false && kpiObj['color'] != '') ? kpiObj['color'] : 'grey') + '"> ' + kpiTitle + '(' + ((kpiObj.hasOwnProperty('count') !== false) ? kpiObj['count'] : 0) + ') </span>');
							});

							if (kpi_html.length > 0) {
								jQuery('#sm_bottom_bar_left').append('<div id="sm_dashboard_kpi" class="ml-4 mt-2">' + kpi_html.join("<span class='sm_separator'> | </span>") + '</div>');
							}
						}
					} else {
						window.smart_manager.kpiData = {};
					}

				if (window.smart_manager.currentVisibleColumns.length > 0) {
					if (window.smart_manager.isColumnModelUpdated) {
						window.smart_manager.formatGridColumns();

						window.smart_manager.hot.updateSettings({
							data: window.smart_manager.currentDashboardData,
							columns: window.smart_manager.currentVisibleColumns,
							colHeaders: window.smart_manager.column_names
						})
					} else {
						window.smart_manager.hot.updateSettings({
							data: window.smart_manager.currentDashboardData,
							forceRender: window.smart_manager.firstLoad
						})
					}
					if (window.smart_manager.firstLoad) {
						window.smart_manager.firstLoad = false
					}
				}
				window.smart_manager.showLoader(false);
				
				// Handle pro version row limitations
				if (window.smart_manager.sm_beta_pro == 0) {
					if (typeof (window.smart_manager.modifiedRows) != 'undefined') {
						if (window.smart_manager.modifiedRows.length >= window.smart_manager.sm_updated_successful) {
							//call to function for highlighting selected row ids
							if (typeof (window.smart_manager.disableSelectedRows) !== "undefined" && typeof (window.smart_manager.disableSelectedRows) === "function") {
								window.smart_manager.disableSelectedRows(true);
							}
						}
					}
				}
			}

			window.smart_manager.refreshBottomBar();

			if (window.smart_manager.totalRecords == 0) {
				jQuery('#sm_beta_display_records').show();
				jQuery('#sm_beta_display_records').text(sprintf(
					/* translators: %s: dashboard display name */
					_x('No %s Found', 'bottom bar status', 'smart-manager-for-wp-e-commerce'), window.smart_manager.dashboardDisplayName));
				jQuery('#sm_pagination_controls').remove();
			} else {
				jQuery('#sm_beta_display_records').show();
				
				// Remove existing pagination controls and add updated ones
				jQuery('#sm_pagination_controls').remove();
				jQuery('#sm_bottom_bar_right').append(window.smart_manager.buildPaginationHtml());
				jQuery('#sm_bottom_bar_right').show();
			}

			window.smart_manager.gettingData = 0;
		}
	}

	//Function to refresh the bottom bar of grid
	SmartManager.prototype.refreshBottomBar = function () {
		// Calculate pagination info
		const startRecord = (window.smart_manager.currentPageNumber - 1) * window.smart_manager.limit + 1;
		const endRecord = Math.min(window.smart_manager.currentPageNumber * window.smart_manager.limit, window.smart_manager.displayTotalRecords);
		
		let msg = (window.smart_manager.currentDashboardData.length > 0) ? `
			<span class="text-sm text-sm-base-muted-foreground leading-5">Showing <span class="text-sm-base-foreground font-normal">${startRecord}-${endRecord}</span> of ${window.smart_manager.displayTotalRecords} ${window.smart_manager.dashboardDisplayName.toLowerCase()}</span>
		` : sprintf(
				/* translators: %s: dashboard display name */
				_x('No %s Found', 'bottom bar status', 'smart-manager-for-wp-e-commerce'), window.smart_manager.dashboardDisplayName);
		jQuery('#sm_beta_display_records').html(msg);
	}

	SmartManager.prototype.getDataDefaultParams = function (params) {
		let defaultParams = {};
		defaultParams.data = {
			cmd: 'get_data_model',
			active_module: window.smart_manager.dashboardKey,
			security: window.smart_manager.saCommonNonce,
			is_public: (window.smart_manager.sm_dashboards_public.indexOf(window.smart_manager.dashboardKey) != -1) ? 1 : 0,
			sm_page: window.smart_manager.page,
			sm_limit: window.smart_manager.limit,
			SM_IS_WOO30: window.smart_manager.sm_is_woo30,
			sort_params: (window.smart_manager.currentDashboardModel.hasOwnProperty('sort_params')) ? window.smart_manager.currentDashboardModel.sort_params : '',
			table_model: (window.smart_manager.currentDashboardModel.hasOwnProperty('tables')) ? window.smart_manager.currentDashboardModel.tables : '',
			search_text: (window.smart_manager.searchType == 'simple') ? window.smart_manager.simpleSearchText : '',
			advanced_search_query: JSON.stringify((window.smart_manager.searchType != 'simple' || window.smart_manager.loadingDashboardForsavedSearch === true) ? window.smart_manager.advancedSearchQuery : []),
			show_variations: (typeof window.smart_manager.getShowVariationsState === 'function') ? window.smart_manager.getShowVariationsState() : false,
		};

		// Code for passing extra param for view handling
		if (window.smart_manager.sm_beta_pro == 1) {
			let viewSlug = window.smart_manager.getViewSlug(window.smart_manager.dashboardName);
			defaultParams.data['is_view'] = 0;

			if (viewSlug) {
				defaultParams.data['is_view'] = 1;
				defaultParams.data['active_view'] = viewSlug;
				defaultParams.data['active_module'] = (window.smart_manager.viewPostTypes.hasOwnProperty(viewSlug)) ? window.smart_manager.viewPostTypes[viewSlug] : window.smart_manager.dashboardKey;
			}
			// Code for passing extra param for handling tasks
			defaultParams.data = ("undefined" !== typeof (window.smart_manager.addTasksParams) && "function" === typeof (window.smart_manager.addTasksParams) && 1 == window.smart_manager.sm_beta_pro) ? window.smart_manager.addTasksParams(defaultParams.data) : defaultParams.data;
		}

		if (typeof params != 'undefined') {
			if (Object.getOwnPropertyNames(params).length > 0) {
				let paramsData = (params.hasOwnProperty('data')) ? params.data : {}
				if (Object.getOwnPropertyNames(paramsData).length > 0) {
					defaultParams = Object.assign(paramsData, defaultParams.data);
				}
				defaultParams = Object.assign(params, defaultParams);
			}
		}

		window.smart_manager.currentGetDataParams = defaultParams;
	}

	SmartManager.prototype.getData = function (params = {}) {
		window.smart_manager.gettingData = 1;
		window.smart_manager.isRefreshingLoadedPage = false;

		// Reset save button to muted state on data load
		window.smart_manager.setSaveButtonState(false);

		if (window.smart_manager.page == 1) {
			if (typeof (window.smart_manager.getDataDefaultParams) !== "undefined" && typeof (window.smart_manager.getDataDefaultParams) === "function") {
				window.smart_manager.getDataDefaultParams(params);
				window.smart_manager.currentGetDataParams.hideLoader = false
			}
		} else {
			if (typeof (window.smart_manager.currentGetDataParams.data) != 'undefined' && typeof (window.smart_manager.currentGetDataParams.data.sm_page) != 'undefined') {

				if (params.hasOwnProperty('refreshPage')) {
					window.smart_manager.isRefreshingLoadedPage = true;
					window.smart_manager.currentGetDataParams.data.sm_page = params.refreshPage;
					window.smart_manager.currentGetDataParams.async = false;
				} else {
					window.smart_manager.currentGetDataParams.data.sm_page = window.smart_manager.page;
				}
				window.smart_manager.currentGetDataParams.data.sort_params = window.smart_manager.currentDashboardModel.sort_params;
			}
		}
		window.smart_manager.sendRequest(window.smart_manager.currentGetDataParams, window.smart_manager.set_data);
	}

	SmartManager.prototype.inline_edit_dlg = function (params) {
		if (params.dlg_width == '' || typeof (params.dlg_width) == 'undefined') {
			modal_width = 350;
		} else {
			modal_width = params.dlg_width;
		}

		if (params.dlg_height == '' || typeof (params.dlg_height) == 'undefined') {
			modal_height = 390;
		} else {
			modal_height = params.dlg_height;
		}

		let ok_btn = [{
			text: _x("OK", 'button', 'smart-manager-for-wp-e-commerce'),
			class: 'sm_inline_dialog_ok sm-dlg-btn-yes',
			click: function () {
				jQuery(this).dialog("close");
			}
		}];

		jQuery("#sm_inline_dialog").html(params.content);

		let dialog_params = {
			closeOnEscape: true,
			draggable: false,
			dialogClass: 'sm_ui_dialog_class',
			height: modal_height,
			width: modal_width,
			modal: (params.hasOwnProperty('modal')) ? params.modal : false,
			position: {
				my: (params.hasOwnProperty('position_my')) ? params.position_my : 'left center+250px',
				at: (params.hasOwnProperty('position_my')) ? params.position_at : 'left center',
				of: params.target
			},
			create: function (event, ui) {
				if (!(params.hasOwnProperty('title') && params.title != '')) {
					jQuery(".ui-widget-header").hide();
				}
			},
			open: function () {

				if (params.hasOwnProperty('show_close_icon') && params.show_close_icon === false) {
					jQuery(this).find('.ui-dialog-titlebar-close').hide();
				}

				jQuery('.ui-widget-overlay').bind('click', function () {
					jQuery('#sm_inline_dialog').dialog('close');
				});

				if (!(params.hasOwnProperty('title') && params.title != '')) {
					jQuery(".ui-widget-header").hide();
				} else if ((params.hasOwnProperty('title') && params.title != '')) {
					jQuery(".ui-widget-header").show();
				}

				if (params.hasOwnProperty('customDataAttributes')) {
					Object.entries(params.customDataAttributes).forEach(([key, value]) => {
						jQuery(this).attr(key, value);
					});
				}

				jQuery(this).html(params.content);
			},
			close: function (event, ui) {
				jQuery(this).dialog('close');
			},
			buttons: (params.hasOwnProperty('display_buttons') && params.display_buttons === false) ? [] : (params.hasOwnProperty('buttons_model') ? params.buttons_model : ok_btn)
		}

		if (params.hasOwnProperty('title')) {
			dialog_params.title = params.title;
		}

		if (params.hasOwnProperty('titleIsHtml')) {
			dialog_params.titleIsHtml = params.titleIsHtml;
		}

		jQuery("#sm_inline_dialog").dialog(dialog_params);
		jQuery('.sm_ui_dialog_class, .ui-widget-overlay').show();
	}

	SmartManager.prototype.getTextWidth = function (text, font) {
		// re-use canvas object for better performance
		let canvas = window.smart_manager.getTextWidthCanvas || (window.smart_manager.getTextWidthCanvas = document.createElement("canvas"));
		let context = canvas.getContext("2d");
		context.font = font;
		let metrics = context.measureText(text);
		return metrics.width;
	}

	SmartManager.prototype.enableDisableButtons = function () {
		//enabling the action buttons
		(window.smart_manager.selectedRows.length > 0 || window.smart_manager.selectAll) ? window.smart_manager.showFloatingActionBar() : window.smart_manager.hideFloatingActionBar(); 
	}

	SmartManager.prototype.disableSelectedRows = function (readonly) {
		for (let i = 0; i < window.smart_manager.hot.countRows(); i++) {
			if (window.smart_manager.modifiedRows.indexOf(i) != -1) {
				continue;
			}
			for (let j = 0; j < window.smart_manager.hot.countCols(); j++) {
				window.smart_manager.hot.setCellMeta(i, j, 'readOnly', readonly);
			}
		}
	}

	//Function to highlight the edited cells
	SmartManager.prototype.highlightEditedCells = function () {

		if (typeof window.smart_manager.dirtyRowColIds == 'undefined' || Object.getOwnPropertyNames(window.smart_manager.dirtyRowColIds).length == 0) {
			return;
		}

		for (let row in window.smart_manager.dirtyRowColIds) {

			window.smart_manager.dirtyRowColIds[row].forEach(function (colIndex) {

				cellProp = window.smart_manager.hot.getCellMeta(row, colIndex);
				prevClassName = cellProp.className;

				if (prevClassName == '' || typeof prevClassName == 'undefined' || (typeof (prevClassName) != 'undefined' && prevClassName.indexOf('sm-grid-dirty-cell') == -1)) {
					window.smart_manager.hot.setCellMeta(row, colIndex, 'className', (prevClassName + ' ' + 'sm-grid-dirty-cell'));
					jQuery('.smCheckboxColumnModel input[data-row=' + row + ']').parents('tr').removeClass('sm_edited').addClass('sm_edited');
				}
			});
		}
	}

	SmartManager.prototype.isHTML = RegExp.prototype.test.bind(/(<([^>]+)>)/i);

	SmartManager.prototype.isJSON = function (str) {
		try {
			return (JSON.parse(str) && !!str);
		} catch (e) {
			return false;
		}
	}

	SmartManager.prototype.getCustomRenderer = function (col) {

		let customRenderer = '';

		let colObj = window.smart_manager.currentVisibleColumns[col];

		if (typeof (colObj) != 'undefined') {

			let renderer = (colObj.hasOwnProperty('renderer')) ? colObj.renderer : '';

			if (colObj.hasOwnProperty('type')) {
				if (colObj.type == 'numeric') {
					customRenderer = 'numericRenderer';
				} else if (colObj.type == 'text' && renderer != 'html') {
					customRenderer = 'customTextRenderer';
				} else if (colObj.type == 'html' || renderer == 'html') {
					customRenderer = 'customHtmlRenderer';
				} else if (colObj.type == 'checkbox') {
					// customRenderer = 'customCheckboxRenderer';
				} else if (colObj.type == 'password') {
					customRenderer = 'customPasswordRenderer';
				}
			}
		}

		return customRenderer;
	}









	SmartManager.prototype.loadGrid = function () {
		jQuery('#sm_editor_grid').html('');
		window.smart_manager.formatGridColumns();
		window.smart_manager.hot = new Handsontable(window.smart_manager.container, {
			data: window.smart_manager.currentDashboardData,
			height: window.smart_manager.grid_height,
			width: window.smart_manager.grid_width,
			//   allowEmpty: true, // default is true
			rowHeaders: function (index) {
				return '<input type="checkbox" />';
			}, // for row headings (like numbering)
			colHeaders: true, // for col headings
			//   renderAllRows: true,
			//   viewportRowRenderingOffset: 100, // -- problem no. of rows outside the visible part of table. Default: auto
			stretchH: 'all', // strech
			autoColumnSize: { useHeaders: true },
			//   wordWrap: true, //default is true
			//   autoRowSize: false, // by default its undefined which is also same
			rowHeights: window.smart_manager.rowHeight,
			colWidths: 100,
			bindRowsWithHeaders: true,
			manualColumnResize: true,
			//   manualRowResize: true,
			manualColumnMove: false,
			columnSorting: true,
			//   columnSorting: { sortEmptyCells: false }, //--problem
			//   fillHandle: 'vertical', //for excel like filling of cells
			fillHandle: { //for excel like filling of cells
				direction: 'vertical',
				autoInsertRow: false // For restricting to add new rows automatically when dragging the cells
			},
			persistentState: true,
			customBorders: true,
			// fixedColumnsLeft: 1,
			//   disableVisualSelection: true,
			columns: window.smart_manager.currentVisibleColumns,
			colHeaders: window.smart_manager.column_names,
		});

		window.smart_manager.hotPlugin.columnSortPlugin = window.smart_manager.hot.getPlugin('columnSorting');
		window.smart_manager.hotPlugin.manualColumnResizePlugin = window.smart_manager.hot.getPlugin('manualColumnResize')

		window.smart_manager.hot.updateSettings({

			cells: function (row, col, prop) {

				let customRenderer = window.smart_manager.getCustomRenderer(col);
				if (customRenderer != '') {
					let cellProperties = {};
					cellProperties.renderer = customRenderer;
					return cellProperties;
				}
			},

			// Custom header renderer for action column
			afterGetColHeader: function(col, TH) {
				const headerText = window.smart_manager.column_names[col];
				if (headerText === 'sm_action_header') {
					TH.innerHTML = '';
					TH.className = 'sticky right-0 z-[100] bg-[#F5F5F5] border-l border-[#E5E5E5]';
					
					const headerWrapper = document.createElement('div');
					headerWrapper.className = 'flex items-center justify-center h-full p-1';
					
					const btn = document.createElement('button');
					btn.type = 'button';
					btn.className = 'sm-action-header-btn flex items-center justify-center w-7 h-7 p-0 border-none bg-[#EFEEFF] rounded cursor-pointer text-[#737373] transition-all duration-150 hover:bg-[#E5E5E5] hover:text-[#333]';
					btn.title = _x('Column Manager', 'action column header title', 'smart-manager-for-wp-e-commerce');
					btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.665 6.33164V1.99831C12.665 1.26193 12.0681 0.664978 11.3317 0.664978H1.99837C1.26199 0.664978 0.665039 1.26193 0.665039 1.99831V11.3316C0.665039 12.068 1.26199 12.665 1.99837 12.665H6.66504M4.66504 0.664978V12.665M8.66504 0.664978V6.99831M8.64135 10.9983H13.3554M10.9984 13.3553V8.6413" stroke="#6B63F1" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/></svg>';
					
					// Open quick column manager on click
					btn.onclick = function(e) {
						e.preventDefault();
						e.stopPropagation();
						if (typeof window.smart_manager.toggleQuickColumnManager === 'function') {
							window.smart_manager.toggleQuickColumnManager(btn, e);
						}
					};
					
					headerWrapper.appendChild(btn);
					TH.appendChild(headerWrapper);
				} else {
					// Add column type class for sorting icon differentiation.
					if (window.smart_manager.currentVisibleColumns && window.smart_manager.currentVisibleColumns[col]) {
						const colObj = window.smart_manager.currentVisibleColumns[col];
						const colType = colObj.type || 'text';
						const colName = colObj.col_name || '';
						// Remove existing type classes.
						TH.classList.remove('sm-col-numeric', 'sm-col-text', 'sm-col-id');
						// Add appropriate class based on column type or source.
						if (['_sale_price', '_regular_price', '_price'].some(field => colName.includes(field))) {
							TH.classList.add('sm-col-id');
						} else if (colType === 'numeric') {
							TH.classList.add('sm-col-numeric');
						} else {
							TH.classList.add('sm-col-text');
						}
					}
				}
			},

			afterOnCellMouseOver: function (e, coords, td) {
				if (coords.row < 0 || coords.col < 0) {
					return;
				}

				let col = this.getCellMeta(coords.row, coords.col),
					current_cell_value = this.getDataAtCell(coords.row, coords.col);
				if (typeof (col.type) != 'undefined' && current_cell_value) {
					if (col.type == 'sm.image') {
						let row_title = '';
						if (window.smart_manager.dashboardKey == 'product') {
							row_title = this.getDataAtRowProp(coords.row, 'posts_post_title');
							row_title = (window.smart_manager.isHTML(row_title) == true) ? jQuery(row_title).text() : row_title;
							row_title = row_title;
						}
						let params = {
							'current_cell_value': current_cell_value,
							'event': e,
							'title': row_title
						};

						if (typeof (window.smart_manager.showImagePreview) !== "undefined" && typeof (window.smart_manager.showImagePreview) === "function") {
							window.smart_manager.showImagePreview(params);
						}
					}
				}
			},

			afterOnCellMouseOut: function (e, coords, td) {
				if (jQuery('#sm_img_preview').length > 0) {
					jQuery('#sm_img_preview').remove();
				}
			},

			afterRender: function (isForced) { //TODO: check
				if (isForced === true) {
					window.smart_manager.showLoader(false);
				}
			},

			beforeColumnSort: function (currentSortConfig, destinationSortConfigs) {
				window.smart_manager.hotPlugin.columnSortPlugin.setSortConfig(destinationSortConfigs);
				if (typeof (destinationSortConfigs) != 'undefined') {
					if (destinationSortConfigs.length > 0) {
						if (destinationSortConfigs[0].hasOwnProperty('column')) {
							if (window.smart_manager.currentVisibleColumns.length > 0) {
								let colObj = window.smart_manager.currentVisibleColumns[destinationSortConfigs[0].column];

								window.smart_manager.currentDashboardModel.sort_params = {
									'column': colObj.src,
									'sortOrder': destinationSortConfigs[0].sortOrder
								};

								window.smart_manager.columnSort = true;
							}
						}
					} else {
						if (window.smart_manager.currentDashboardModel.hasOwnProperty('sort_params')) {
							window.smart_manager.currentDashboardModel.sort_params = Object.assign({}, window.smart_manager.defaultSortParams);
						}
						window.smart_manager.columnSort = false;
					}

					window.smart_manager.page = 1;
					if ( !window.smart_manager.userSwitchingDashboard && ( (window.smart_manager.columnSort === true) || (destinationSortConfigs.length === 0 && currentSortConfig.length > 0) )) {
						window.smart_manager.getData();
					}
				}
				return false; // The blockade for the default sort action.
			},

			afterCreateRow: function (row, amount) {

				while (amount > 0) {
					let idKey = window.smart_manager.getKeyID();
					let row_data_id = window.smart_manager.hot.getDataAtRowProp(row, idKey);

					if (typeof (row_data_id) != 'undefined' && row_data_id) {
						return;
					}

					window.smart_manager.addRecords_count++;
					window.smart_manager.hot.setDataAtRowProp(row, idKey, 'sm_temp_' + window.smart_manager.addRecords_count);

					let val = '',
						colObj = {};

					for (let key in window.smart_manager.currentColModel) {

						colObj = window.smart_manager.currentColModel[key];

						if (colObj.hasOwnProperty('data')) {
							if (jQuery.inArray(colObj.data, window.smart_manager.defaultColumnsAddRow) >= 0) {

								if (typeof colObj.defaultValue != 'undefined') {
									val = colObj.defaultValue;
								} else {
									if (typeof colObj.selectOptions != 'undefined') {
										val = Object.keys(colObj.selectOptions)[0]
									} else {
										val = 'test';
									}
								}

								window.smart_manager.hot.setDataAtRowProp(row, colObj.data, val);
							}
						}
					}
					row++;
					amount--;
				}
			},

			afterChange: function (changes, source) {

				if (window.smart_manager.selectAll === true || window.smart_manager.isRefreshingLoadedPage || changes === null) {
					return;
				}

				let col = {},
					cellProp = {},
					colIndex = '',
					idKey = window.smart_manager.getKeyID(),
					colTypesDisabledHiglight = new Array('sm.image');

				changes.forEach(([row, prop, oldValue, newValue]) => {
					if ((row < 0 && prop == 0) || (oldValue == newValue && String(oldValue).length == String(newValue).length)) {
						return;
					}

					if (window.smart_manager.modifiedRows.indexOf(row) == -1) {
						// To prevent updating more than 3 records by dragging the columns.
						if((parseInt(window.smart_manager.sm_beta_pro) !== 1) && (parseInt(window.smart_manager.modifiedRows.length) >= parseInt(window.smart_manager.sm_updated_successful))) {
							return;
						}
						window.smart_manager.modifiedRows.push(row);
					}

					colIndex = window.smart_manager.hot.propToCol(prop);
					if (typeof (colIndex) == 'number') {
						col = window.smart_manager.hot.getCellMeta(row, colIndex);
					}
					let id = window.smart_manager.hot.getDataAtRowProp(row, idKey);

					if ((oldValue != newValue || String(oldValue).length != String(newValue).length) && prop != idKey && colTypesDisabledHiglight.indexOf(col.type) == -1) { //for inline edit
						cellProp = window.smart_manager.hot.getCellMeta(row, prop);
						prevClassName = (typeof (cellProp.className) != 'undefined') ? cellProp.className : '';

						//dirty cells variable
						if (window.smart_manager.dirtyRowColIds.hasOwnProperty(row) === false) {
							window.smart_manager.dirtyRowColIds[row] = new Array();
						}

						if (window.smart_manager.dirtyRowColIds[row].indexOf(colIndex) == -1) {
							window.smart_manager.dirtyRowColIds[row].push(colIndex);
						}
						window.smart_manager.setSaveButtonState(true);
						if (prevClassName == '' || (typeof (prevClassName) != 'undefined' && prevClassName.indexOf('sm-grid-dirty-cell') == -1)) {

							//creating the edited json string

							if (window.smart_manager.editedData.hasOwnProperty(id) === false) {
								window.smart_manager.editedData[id] = {};
							}

							if (Object.entries(col).length === 0) {
								if (typeof (window.smart_manager.currentColModel) != 'undefined') {
									window.smart_manager.currentColModel.forEach(function (value) {
										if (value.hasOwnProperty('data') && value.data == prop) {
											col.src = value.src;
										}
									});
								}
							}
							window.smart_manager.editedData[id][col.src] = (window.smart_manager.editedAttribueSlugs && (false === (window.smart_manager.excludedEditedFieldKeys).includes(col.src))) ? window.smart_manager.editedAttribueSlugs : newValue;
							window.smart_manager.editedCellIds.push({ 'row': row, 'col': colIndex });
						}

						if (window.smart_manager.sm_beta_pro == 0) {
							if (typeof (window.smart_manager.modifiedRows) != 'undefined') {
								if (window.smart_manager.modifiedRows.length >= window.smart_manager.sm_updated_successful) {
									//call to function for highlighting selected row ids
									if (typeof (window.smart_manager.disableSelectedRows) !== "undefined" && typeof (window.smart_manager.disableSelectedRows) === "function") {
										window.smart_manager.disableSelectedRows(true);
									}
								}
							}
						}
					}
				});

				//call to function for highlighting edited cell ids
				if (typeof (window.smart_manager.highlightEditedCells) !== "undefined" && typeof (window.smart_manager.highlightEditedCells) === "function") {
					window.smart_manager.highlightEditedCells();
				}

				window.smart_manager.hot.render();
			},

			afterOnCellMouseUp: function (e, coords, td) {
				if ((!coords) || (coords && (coords.row === -1) && (coords.col !== -1))) {
					return;
				}
				window.smart_manager.editedAttribueSlugs = '';
				window.smart_manager.selectAll = false
				//Code for having checkbox column selection
				if (coords.col === -1) {
					//code for handling header checkbox selection
					if (window.smart_manager.hot) {
						if (window.smart_manager.hot.selection) {
							if (window.smart_manager.hot.selection.highlight) {
								if (window.smart_manager.hot.selection.highlight.selectedRows) {
									window.smart_manager.selectedRows = window.smart_manager.hot.selection.highlight.selectedRows
								}
								if (window.smart_manager.hot.selection.highlight.selectAll) {
									window.smart_manager.selectAll = true
									window.smart_manager.selectedRows = window.smart_manager.hot.selection.highlight.selectedRows = [];
								}
							}
						}
					}

					if (typeof (window.smart_manager.enableDisableButtons) !== "undefined" && typeof (window.smart_manager.enableDisableButtons) === "function") {
						window.smart_manager.enableDisableButtons();
					}
					return;
				}

				let col = this.getCellMeta(coords.row, coords.col);
				if (typeof (col.readOnly) != 'undefined' && col.readOnly == 'true') {
					return;
				}

				let id_key = window.smart_manager.getKeyID(),
					row_data_id = this.getDataAtRowProp(coords.row, id_key),
					current_cell_value = this.getDataAtCell(coords.row, coords.col),
					params = {
						'coords': coords,
						'td': td,
						'colObj': col,
						'row_data_id': row_data_id,
						'current_cell_value': current_cell_value
					};

				window.smart_manager.defaultEditor = true;
				jQuery('#sm_editor_grid').trigger('sm_grid_on_afterOnCellMouseUp', [params]);
				if (window.smart_manager.hasOwnProperty('defaultEditor') && window.smart_manager.defaultEditor === false) {
					return;
				}

				if (typeof (col.type) != 'undefined' && col.type == 'sm.multipleImage') { // code to handle the functionality to handle editing of 'image' data types
					let galleryImages = current_cell_value,
						imageGalleryHtml = `<div class="sm_gallery_image_parent" data-id="${row_data_id}" data-col="${col.src || ''}" data-row= "${coords.row || 0}">`;

					if (Object.keys(galleryImages).length > 0) {
						if (typeof (window.smart_manager.generateImageGalleryDlgHtml) !== "undefined" && typeof (window.smart_manager.generateImageGalleryDlgHtml) === "function") {
							imageGalleryHtml += window.smart_manager.generateImageGalleryDlgHtml(galleryImages);
						}
					}

					imageGalleryHtml += '</div>';

					if (Object.entries(col).length === 0) {
						if (typeof (window.smart_manager.currentColModel) != 'undefined') {
							window.smart_manager.currentColModel.forEach(function (value) {
								if (value.hasOwnProperty('data') && value.data == col.prop) {
									col.src = value.src;
								}
							});
						}
					}
					if ('undefined' !== typeof (window.smart_manager.displayGalleryImagesModal) && 'function' === typeof (window.smart_manager.displayGalleryImagesModal) && row_data_id && col.src && imageGalleryHtml) {
						window.smart_manager.displayGalleryImagesModal({ id: row_data_id, src: col.src, imageGalleryHtml: imageGalleryHtml, rowNo: coords.row });
					}
				}

				if (typeof (col.type) != 'undefined' && col.type == 'sm.image' && coords.row >= 0) { // code to handle the functionality to handle editing of 'image' data types

					if (typeof (window.smart_manager.handleMediaUpdate) !== "undefined" && typeof (window.smart_manager.handleMediaUpdate) === "function") {

						let params = { row_data_id: row_data_id };

						// When an image is selected, run a callback.
						params.callback = function (attachment) {
							if (typeof (attachment) == 'undefined') {
								return;
							}
							let params = {};
							params = {
								editedImage: JSON.stringify({ [row_data_id]: { [col.src]: attachment['id'] } }),
								row: coords.row,
								col: coords.col,
								value: attachment['url'],
								source: 'image_inline_update'
							}
							let editedColumnName = '';
							if ("undefined" !== typeof (window.smart_manager.getColDisplayName) && "function" === typeof (window.smart_manager.getColDisplayName)) {
								editedColumnName = window.smart_manager.getColDisplayName(col.src);
							}

							if (1 == window.smart_manager.sm_beta_pro) {
								window.smart_manager.processName = _x('Inline Edit', 'process name', 'smart-manager-for-wp-e-commerce');
								window.smart_manager.processContent = (editedColumnName) ? editedColumnName : col.src;
								if ("undefined" !== typeof (window.smart_manager.inlineUpdateImage) && "function" === typeof (window.smart_manager.inlineUpdateImage)) {
									window.smart_manager.processCallback = window.smart_manager.inlineUpdateImage;
								}
								window.smart_manager.processCallbackParams = params;
								if ("undefined" !== typeof (window.smart_manager.showTitleModal) && "function" === typeof (window.smart_manager.showTitleModal)) {
									window.smart_manager.showTitleModal()
								}
							} else {
								if ("undefined" !== typeof (window.smart_manager.inlineUpdateImage) && "function" === typeof (window.smart_manager.inlineUpdateImage) && params) {
									window.smart_manager.inlineUpdateImage(params);
								}
							}

						};
						window.smart_manager.handleMediaUpdate(params);
					}
				}

				if (typeof (col.type) != 'undefined' && col.type == 'sm.longstring') {

					if (typeof (wp.editor.getDefaultSettings) == 'undefined') {
						return;
					}

					let unformatted_val = current_cell_value; //Code for unformatting the 'longstring' type values
					let initializeWPEditor = function () {
						wp.editor.remove('sm_beta_lonstring_input');
						wp.editor.initialize('sm_beta_lonstring_input', {
							tinymce: {
								height: 200,
								wpautop: true,
								plugins: 'charmap colorpicker compat3x directionality fullscreen hr image lists media paste tabfocus textcolor wordpress wpautoresize wpdialogs wpeditimage wpemoji wpgallery wplink wptextpattern wpview',
								toolbar1: 'formatselect bold,italic,strikethrough,|,bullist,numlist,blockquote,|,justifyleft,justifycenter,justifyright,|,link,unlink,wp_more,|,spellchecker,fullscreen,wp_adv',
								toolbar2: 'underline,justifyfull,forecolor,|,pastetext,pasteword,removeformat,|,media,charmap,|,outdent,indent,|,undo,redo,wp_help'
							},
							quicktags: { buttons: 'strong,em,link,block,del,img,ul,ol,li,code,more,spell,close,fullscreen' },
							mediaButtons: true
						});
					}
					window.smart_manager.modal = {
						title: col.key || '',
						content: '<textarea style="width:100%;height:100%;z-index:100;" id="sm_beta_lonstring_input">' + unformatted_val + '</textarea>',
						autoHide: false,
						cta: {
							title: _x('Ok', 'button', 'smart-manager-for-wp-e-commerce'),
							callback: function () {
								let content = wp.editor.getContent('sm_beta_lonstring_input');
								window.smart_manager.hot.setDataAtCell(coords.row, coords.col, content, 'sm.longstring_inline_update');
								wp.editor.remove('sm_beta_lonstring_input');
							}
						},
						onCreate: initializeWPEditor,
						onUpdate: initializeWPEditor
					}
					window.smart_manager.showModal()
				}

				if (col.editor == 'sm.serialized') { //Code for handling serialized complex data handling

					window.smart_manager.JSONEditorObj = {} // hold JSONEditor instance

					let initializeJSONEditor = function () {
						let container = document.getElementById("sm_beta_json_editor");
						jQuery(container).html('');
						let options = {
							"mode": 'tree',
							"search": true
						};
						window.smart_manager.JSONEditorObj = new JSONEditor(container, options);
						let val = (window.smart_manager.isJSON(current_cell_value)) ? JSON.parse(current_cell_value) : current_cell_value;

						if (col.editor_schema && window.smart_manager.isJSON(col.editor_schema)) {
							window.smart_manager.JSONEditorObj.setSchema(JSON.parse(col.editor_schema));
						}

						window.smart_manager.JSONEditorObj.set(val);
						window.smart_manager.JSONEditorObj.expandAll();
					}

					window.smart_manager.modal = {
						title: col.key || '',
						content: '<div id="sm_beta_json_editor"></div>',
						autoHide: false,
						cta: {
							title: _x('Ok', 'button', 'smart-manager-for-wp-e-commerce'),
							callback: function () {
								let content = (window.smart_manager.JSONEditorObj) ? JSON.stringify(window.smart_manager.JSONEditorObj.get()) : '';
								window.smart_manager.hot.setDataAtCell(coords.row, coords.col, content, 'sm.serialized_inline_update');
								window.smart_manager.JSONEditorObj = {}
								wp.editor.remove('sm_beta_json_editor')
							}
						},
						onCreate: initializeJSONEditor,
						onUpdate: initializeJSONEditor
					}
					window.smart_manager.showModal()
				}

				if (typeof (col.type) != 'undefined' && col.type == 'sm.multilist') { // code to handle the functionality to handle editing of 'multilist' data types
					let actual_value = col.values,
						multiselect_data = new Array(),
						multiselect_chkbox_list = '',
						current_value = new Array();
					// Extracting selected values safely.
					if ('undefined' !== typeof (current_cell_value) && (null !== current_cell_value) && ('' !== current_cell_value)) {
						current_value = ('string' === typeof (current_cell_value)) ? current_cell_value.split(', ') : new Array(String(current_cell_value));
					}
					// Initialize all data and assign children to their respective parents.
					for (let index in actual_value) {
						let title = actual_value[index].hasOwnProperty('title') ? actual_value[index].title : actual_value[index].term;
						let parent_id = actual_value[index]['parent'];
						multiselect_data[index] = {
							id: index,
							term: actual_value[index].term,
							title: title,
							child: {}
						};
						if ((0 !== parseInt(parent_id)) && multiselect_data[parent_id]) {
							multiselect_data[parent_id].child[index] = multiselect_data[index]; // Assign child
						}
					}
					// Keep parent ids only in root level for search.
					multiselect_data = multiselect_data.filter((item, index) => {
						let parent_id = actual_value[index]['parent'];
						return (0 === parseInt(parent_id)); // Keep only items where parent is 0 (root level for search).
					});
					// Add the search box before the checkbox list and generate final checkbox list.
					multiselect_chkbox_list = `<div id="sm_multiselect_container">
					<div class="mb-4 bg-sm-base-muted border border-sm-base-input flex gap-1 h-9 items-center overflow-hidden px-3 py-1 rounded-lg shadow-[0_0.0625rem_0.125rem_0_rgba(0,0,0,0.05)] w-full focus-within:border-[#8781f1]"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0"><path d="M14 14L10 10M11.3333 6.66667C11.3333 9.244 9.244 11.3333 6.66667 11.3333C4.08934 11.3333 2 9.244 2 6.66667C2 4.08934 4.08934 2 6.66667 2C9.244 2 11.3333 4.08934 11.3333 6.66667Z" stroke="#737373" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"></path></svg><input data-ul-id="sm-multilist-data" onkeyup="window.smart_manager.processListSearch(this)" type="text" placeholder="${_x('Search ' + (col.key || 'Taxonomy') + '...', 'placeholder', 'smart-manager-for-wp-e-commerce')}" class="sm-input flex-1 font-normal text-sm leading-5 text-sm-base-foreground bg-transparent border-0 outline-none overflow-hidden text-ellipsis whitespace-nowrap focus:outline-none focus:ring-0 focus:shadow-none"></div>
					${window.smart_manager.generateCheckboxList(multiselect_data, current_value)}
				</div>`
					window.smart_manager.modal = {
						title: _x((col.key || 'Taxonomy'), 'modal title', 'smart-manager-for-wp-e-commerce'),
						content: multiselect_chkbox_list,
						autoHide: false,
						cta: {
							title: _x('Ok', 'button', 'smart-manager-for-wp-e-commerce'),
							callback: function () {
								let mutiselect_edited_text = '';
								let selected_val = jQuery("input[name='chk_multiselect']:checked").map(function () {
									return jQuery(this).val();
								}).get();
								if (selected_val.length > 0) {
									for (var index in selected_val) {
										if (actual_value.hasOwnProperty(selected_val[index])) {
											if (mutiselect_edited_text != '') {
												mutiselect_edited_text += ', ';
											}
											mutiselect_edited_text += selected_val[index];
										}
									}
								}
								window.smart_manager.hot.setDataAtCell(coords.row, coords.col, mutiselect_edited_text, 'sm.multilist_inline_update');
							}
						},
					}
					window.smart_manager.showModal()
				}
			},
			// to handle updating the state on column resize
			afterColumnResize: function (currentColumn, newSize, isDoubleClick) {
				if (window.smart_manager.currentVisibleColumns[currentColumn]) {
					for (let index in window.smart_manager.currentColModel) {
						if (window.smart_manager.currentColModel[index].src == window.smart_manager.currentVisibleColumns[currentColumn].src) {
							window.smart_manager.currentColModel[index].width = newSize
						}
					}
				}
			},
			afterScrollHorizontally: function () {
				if ("undefined" !== typeof (window.smart_manager.refreshColumnsTitleAttribute) && "function" === typeof (window.smart_manager.refreshColumnsTitleAttribute)) {
					window.smart_manager.refreshColumnsTitleAttribute();
				}
			},
			afterOnCellMouseDown: function (e, coords, td) {
				if ((!coords) || (coords && (coords.row === -1) && (coords.col !== -1))) {
					return;
				}
				let col = this.getCellMeta(coords.row, coords.col);
				if ((!col) || (!col.prop) || ("users_user_pass" !== col.prop) || (!window.smart_manager.colEditDisableMessage) || (!window.smart_manager.colEditDisableMessage.disable) || (!window.smart_manager.colEditDisableMessage.error_message)) {
					return;
				}
				window.smart_manager.disableErrorMessage(window.smart_manager.colEditDisableMessage.error_message);
			}
		});
	}

	SmartManager.prototype.event_handler = function () {
		// Code to handle width of the grid based on the WP collapsable menu
		jQuery(document).on('click', '#collapse-menu', function () {
			let current_url = document.URL;

			if (current_url.indexOf("page=smart-manager") == -1) {
				return;
			}

			if (!jQuery(document.body).hasClass('folded')) {
				window.smart_manager.grid_width = document.documentElement.offsetWidth - (document.documentElement.offsetWidth * 0.10);
			} else {
				window.smart_manager.grid_width = document.documentElement.offsetWidth - (document.documentElement.offsetWidth * 0.04);
			}

			window.smart_manager.hot.updateSettings({ 'width': window.smart_manager.grid_width });
			window.smart_manager.hot.render();

			jQuery('#sm_top_bar, #sm_bottom_bar').css('width', window.smart_manager.grid_width + 'px');
			jQuery('#sm_top_bar_actions').css('width', window.smart_manager.grid_width + 'px');
			jQuery('#sm_top_bar_left').css('width', 'calc(' + window.smart_manager.grid_width + 'px - 2em');
		});

		//Code to handle dashboard change in grid
		jQuery(document).off('change', '#sm_dashboard_select').on('change', '#sm_dashboard_select', function () {
			var sm_dashboard_valid = 0,
				sm_selected_dashboard_key = ((window.smart_manager.loadingDashboardForsavedSearch === true) && (window.smart_manager.hasOwnProperty('savedSearchDashboardKey'))) ? window.smart_manager.savedSearchDashboardKey : jQuery(this).val(),
				sm_selected_dashboard_title = ((window.smart_manager.loadingDashboardForsavedSearch === true) && (window.smart_manager.hasOwnProperty('savedSearchDashboardName'))) ? window.smart_manager.savedSearchDashboardName : jQuery("#sm_dashboard_select option:selected").text();

			window.smart_manager.isCustomView = (window.smart_manager.getViewSlug(sm_selected_dashboard_title)) ? true : false;
			window.smart_manager.userSwitchingDashboard = true;
			if (window.smart_manager.sm_beta_pro == 0) {
				sm_dashboard_valid = 0;
				if (window.smart_manager.sm_lite_dashboards.indexOf(sm_selected_dashboard_key) >= 0) {
					sm_dashboard_valid = 1;
				}
			} else {
				sm_dashboard_valid = 1;
			}

			if (sm_dashboard_valid == 1) {

				window.smart_manager.state_apply = true;

				if ("undefined" !== typeof (window.smart_manager.updateState) && "function" === typeof (window.smart_manager.updateState)) {
					("undefined" !== typeof (window.smart_manager.isTasksEnabled) && "function" === typeof (window.smart_manager.isTasksEnabled) && window.smart_manager.isTasksEnabled()) ? window.smart_manager.updateState({ isTasksEnabled: 1 }) : window.smart_manager.updateState();
				}
				window.smart_manager.reset(true);
				window.smart_manager.dashboardKey = sm_selected_dashboard_key;
				window.smart_manager.dashboardName = sm_selected_dashboard_title;
				window.smart_manager.current_selected_dashboard = sm_selected_dashboard_key;
				// Remove existing dropdown to force refresh with new dashboard's searches
				jQuery('#sm-recent-searches-dropdown').remove();

				if ("undefined" !== typeof (window.smart_manager.resetSearch) && "function" === typeof (window.smart_manager.resetSearch)) {
					window.smart_manager.resetSearch();
				}
				if (typeof (window.smart_manager.initialize_advanced_search) !== "undefined" && typeof (window.smart_manager.initialize_advanced_search) === "function" && window.smart_manager.searchType != 'simple') {
					window.smart_manager.initialize_advanced_search();
				}

				if (window.smart_manager.dashboardKey == 'shop_order') {
					jQuery('#print_invoice_sm_editor_grid_btn').show();
				} else {
					jQuery('#print_invoice_sm_editor_grid_btn').hide();
				}

				window.smart_manager.displayShowHideColumnSettings(true);
				jQuery('#sm_editor_grid').trigger('sm_dashboard_change'); //custom trigger
				if ('undefined' !== typeof (window.smart_manager.displayTasks) && 'function' === typeof (window.smart_manager.displayTasks)) {
					window.smart_manager.displayTasks({ dashboardChange: true });
				}
				window.smart_manager.toggleHeader();
				window.smart_manager.setDashboardDisplayName();
				window.smart_manager.updateHeader();
				window.smart_manager.loadDashboard()
				 window.smart_manager.updateAdvancedSearchButtonState()
				window.smart_manager.savedSearchConds = {}
			} else {
				jQuery(this).val(window.smart_manager.current_selected_dashboard);
				window.smart_manager.notification = {
					message: sprintf(
						/* translators: %1$s: dashboard display name %2$s: success message %3$s: pricing page link */
						_x('For managing %1$s, %2$s %3$s version', 'modal content', 'smart-manager-for-wp-e-commerce'), sm_selected_dashboard_title, window.smart_manager.sm_success_msg, '<a href="' + window.smart_manager.pricingPageURL + '" target="_blank">' + _x('Pro', 'modal content', 'smart-manager-for-wp-e-commerce') + '</a>'), hideDelay: window.smart_manager.notificationHideDelayInMs
				}
				window.smart_manager.showNotification()
			}
			window.smart_manager.saved_bulk_edits = false;
			window.smart_manager.selectedSavedBulkEdit = "";
			jQuery('.sm-save-changes-notification .sm-notification-close').trigger('click');
			// Update custom view UI state
			if (typeof window.smart_manager.toggleCustomViewUI === 'function') {
				window.smart_manager.toggleCustomViewUI();
			}
		})

			.off('click', '.advanced-search-icon').on('click', '.advanced-search-icon', function (e) {
				e.preventDefault();
				if (typeof (window.smart_manager.showPannelDialog) !== "undefined" && typeof (window.smart_manager.showPannelDialog) === "function") {
					jQuery('#search_switch').attr('switchSearchType', 'simple');
					window.smart_manager.searchType = 'advanced'
					window.smart_manager.showPannelDialog(window.smart_manager.advancedSearchRoute)
				}
			})

			.off('click', '#sm-columns-btn').on('click', '#sm-columns-btn', function (e) {
				e.preventDefault();
				if ((typeof window.smart_manager.dirtyRowColIds !== 'undefined') && Object.getOwnPropertyNames(window.smart_manager.dirtyRowColIds).length > 0) {
					window.smart_manager.confirmUnsavedChanges({ 'yesCallback': window.smart_manager.showPannelDialog, 'yesCallbackParams': window.smart_manager.columnManagerRoute, 'hideOnYes': false })
				} else if ("undefined" !== typeof (window.smart_manager.showPannelDialog) && "function" === typeof (window.smart_manager.showPannelDialog)) {
					window.smart_manager.showPannelDialog(window.smart_manager.columnManagerRoute);
				}
			})

			// Custom views panel toggle
			.off('click', '#sm-custom-view-btn').on('click', '#sm-custom-view-btn', function (e) {
				//Need not to show the custom views list on custom view dashboard.
				if(window.smart_manager.isCustomView){
					return;
				}
				e.preventDefault();
				e.stopPropagation();
				const panel = jQuery('#sm-custom-views-panel');
				const isExpanded = !panel.hasClass('hidden');
				panel.toggleClass('hidden');
				jQuery(this).attr('aria-expanded', !isExpanded);
			})

			// Close custom views panel when clicking outside
			.off('click.smCustomViewPanel').on('click.smCustomViewPanel', function (e) {
				if (!jQuery(e.target).closest('#sm-custom-view-btn, #sm-custom-views-panel').length) {
					jQuery('#sm-custom-views-panel').addClass('hidden');
					jQuery('#sm-custom-view-btn').attr('aria-expanded', 'false');
				}
			})

			// Handle custom view item click
			.off('click', '.sm-custom-view-item').on('click', '.sm-custom-view-item', function (e) {
				e.preventDefault();
				const viewSlug = jQuery(this).data('view-slug');
				jQuery('#sm-custom-views-panel').addClass('hidden');
				jQuery('#sm-custom-view-btn').attr('aria-expanded', 'false');
				jQuery('#sm-custom-view-selected').text(jQuery(this).text());
				
				// Load the selected view
				if (viewSlug && window.smart_manager.sm_views[viewSlug]) {
					window.smart_manager.selectDashboard(viewSlug);
				}
			})

			//code for handling resetting column state to default state
			.off('click', 'a#sm_reset_state').on('click', 'a#sm_reset_state', function (e) {
				e.preventDefault();

				let params = {},
					viewSlug = window.smart_manager.getViewSlug(window.smart_manager.dashboardName);
				params.data_type = 'json';
				params.data = {
					cmd: 'reset_state',
					security: window.smart_manager.saCommonNonce,
					active_module: window.smart_manager.dashboardKey
				};

				params.data['dashboard_key'] = window.smart_manager.dashboardKey
				// Code for passing extra param for view handling
				if (1 == window.smart_manager.sm_beta_pro) {
					params.data['is_view'] = 0;

					if (viewSlug) {
						params.data['is_view'] = 1;
						params.data['active_module'] = viewSlug;
					}
				}

				window.smart_manager.sendRequest(params, function (response) {
					let dashboardURLParams = (viewSlug) ? viewSlug + "&is_view=1" : window.smart_manager.dashboardKey;
					window.location.href = (window.smart_manager.smAppAdminURL || window.location.href) + ((window.location.href.indexOf("?") === -1) ? "?" : "&") + "dashboard=" + dashboardURLParams;
				})
			})

			.off('click', '#search_switch').on('click', '#search_switch', function () { //Added for setting click flag for handling for custom views
				window.smart_manager.searchSwitchClicked = true
			})

			.off('change', '#search_switch').on('change', '#search_switch', function (e) { //request for handling switch search types
				//Code for showing notice for custom views
				if ((window.smart_manager.isViewContainSearchParams) && (window.smart_manager.searchSwitchClicked) && typeof (window.smart_manager.showNotification) !== "undefined" && typeof (window.smart_manager.showNotification) === "function") {
					e.target.checked = !e.target.checked
					window.smart_manager.searchSwitchClicked = false
					window.smart_manager.notification = { message: _x('Cannot switch search when using Custom Views', 'search switch notice for custom views', 'smart-manager-for-wp-e-commerce'), hideDelay: window.smart_manager.notificationHideDelayInMs }
					window.smart_manager.showNotification()
					return
				}

				let switchSearchType = jQuery(this).attr('switchSearchType'),
					title = jQuery("label[for='" + jQuery(this).attr("id") + "']").attr('title'),
					content = '';

				jQuery(this).attr('switchSearchType', window.smart_manager.searchType);
				jQuery("label[for='" + jQuery(this).attr("id") + "']").attr('title', title.replace(String(switchSearchType).capitalize(), String(window.smart_manager.searchType).capitalize()));

				window.smart_manager.searchType = switchSearchType;
				content = (window.smart_manager.searchType == 'simple') ? window.smart_manager.simpleSearchContent : window.smart_manager.advancedSearchContent;
				jQuery('#sm_nav_bar_search #search_content').html(content);

				if (window.smart_manager.searchType == 'simple') {
					jQuery('#sm_simple_search_box').val(window.smart_manager.simpleSearchText);
				} else {
					// Code to initialize search col model
					if (typeof (window.smart_manager.initialize_advanced_search) !== "undefined" && typeof (window.smart_manager.initialize_advanced_search) === "function") {
						window.smart_manager.initialize_advanced_search();
					}
					if (((typeof window.smart_manager.dirtyRowColIds !== 'undefined') && Object.getOwnPropertyNames(window.smart_manager.dirtyRowColIds).length > 0) && (window.smart_manager.advancedSearchRuleCount === 0)) {
						window.smart_manager.confirmUnsavedChanges({ 'yesCallback': window.smart_manager.showPannelDialog, 'yesCallbackParams': window.smart_manager.advancedSearchRoute, 'hideOnYes': false })
					} else if ((window.smart_manager.advancedSearchRuleCount === 0) && "undefined" !== typeof (window.smart_manager.showPannelDialog) && "function" === typeof (window.smart_manager.showPannelDialog)) { // Code to show the advanced search dialog in case of no conditions.
						window.smart_manager.showPannelDialog(window.smart_manager.advancedSearchRoute);
					}
				}

				// code for refreshing the dashboard based on the search
				if ((window.smart_manager.simpleSearchText != '' || window.smart_manager.advancedSearchRuleCount > 0) && typeof (window.smart_manager.loadDashboard) !== "undefined" && typeof (window.smart_manager.loadDashboard) === "function") {
					if ((window.smart_manager.loadingDashboardForsavedSearch === false) && (window.smart_manager.isCustomView === false)) {
						window.smart_manager.loadDashboard()
					}
				}

			})

			// Feature notice for simple search on advanced search
			.off('click', '#sm_nav_bar_search').on('click', '#sm_nav_bar_search', function () {
				if (jQuery('#sm_advanced_search_content').length && window.smart_manager.advancedSearchRuleCount > 0 && typeof (window.smart_manager.showNotificationDialog) !== "undefined" && typeof (window.smart_manager.showNotificationDialog) === "function") {
					window.smart_manager.showNotificationDialog(_x('Note:', 'modal title', 'smart-manager-for-wp-e-commerce'),
						`<div class="text-gray-500" style="font-style: italic;">${_x('Currently simple search cannot be applied when advanced search is active. If you want the ability to apply simple search on top of advanced search results, please consider submitting a', 'modal content', 'smart-manager-for-wp-e-commerce')} <a href="https://www.storeapps.org/contact-us/?utm_source=sm&utm_medium=in_app_modal&utm_campaign=feature_request" target="_blank">${_x('feature request', 'modal content', 'smart-manager-for-wp-e-commerce')}</a> ${_x('to help us prioritize this enhancement.', 'modal content', 'smart-manager-for-wp-e-commerce')}</div>`);
				}
			})

			.off('keyup', '#sm_simple_search_box').on('keyup', '#sm_simple_search_box', function () { //request for handling simple search
				clearTimeout(window.smart_manager.searchTimeoutId);
				window.smart_manager.searchTimeoutId = setTimeout(function () {
					//Code for showing notice for custom views
					if ((window.smart_manager.isViewContainSearchParams) && typeof (window.smart_manager.showNotification) !== "undefined" && typeof (window.smart_manager.showNotification) === "function") {
						window.smart_manager.notification = { message: _x('Search string cannot be edited when using Custom Views', 'simple search notice for custom views', 'smart-manager-for-wp-e-commerce'), hideDelay: window.smart_manager.notificationHideDelayInMs }
						window.smart_manager.showNotification()
						jQuery('#sm_simple_search_box').val(window.smart_manager.simpleSearchText)
					} else {
						window.smart_manager.simpleSearchText = jQuery('#sm_simple_search_box').val();
						// Update recent searches when performing a search
						if ((window.smart_manager.sm_beta_pro == 1) && ('undefined'!==typeof(window.smart_manager.updateRecentSearches)) && (window.smart_manager.simpleSearchText) && (window.smart_manager.simpleSearchText.trim() !== '')) {
							window.smart_manager.updateRecentSearches(window.smart_manager.simpleSearchText);
						}
						if ((typeof window.smart_manager.dirtyRowColIds !== 'undefined') && Object.getOwnPropertyNames(window.smart_manager.dirtyRowColIds).length > 0) {
							window.smart_manager.confirmUnsavedChanges({ 'yesCallback': window.smart_manager.refresh.bind(instance) })
						} else if ("undefined" !== typeof (window.smart_manager.refresh) && "function" === typeof (window.smart_manager.refresh)) { // Code to show the advanced search dialog in case of no conditions.
							window.smart_manager.refresh();
						}
					}
				}, 1000);
			})

			//Code to handle the inline save functionality
			.off('click', '#sm-save-btn').on('click', '#sm-save-btn', function () {
				jQuery('.sm-notification-close').trigger('click');
				if (Object.keys(window.smart_manager.editedData).length == 0) {
					window.smart_manager.notification = { message: _x('Please edit a record', 'notification', 'smart-manager-for-wp-e-commerce') }
					window.smart_manager.showNotification()
					return;
				}
				if (window.smart_manager.dashboardKey == 'user' && Object.keys(window.smart_manager.dirtyRowColIds).length > 0) {
					for (let row in window.smart_manager.dirtyRowColIds) {
						let userEmail = window.smart_manager.hot.getDataAtRowProp(row, 'users_user_email');
						if (!userEmail) {
							window.smart_manager.notification = { message: _x('Please enter user email', 'notification', 'smart-manager-for-wp-e-commerce') + '<div style="font-size:0.9em;font-style: italic;margin:1em;">' + _x('Enable', 'notification', 'smart-manager-for-wp-e-commerce') + '<code>' + _x('User Email', 'notification', 'smart-manager-for-wp-e-commerce') + '</code>' + _x('column if not enabled using', 'notification', 'smart-manager-for-wp-e-commerce') + '<a href="https://www.storeapps.org/docs/sm-how-to-show-hide-columns-in-dashboard/?utm_source=sm&utm_medium=in_app&utm_campaign=view_docs" target="_blank"> ' + _x('column show/hide functionality', 'notification', 'smart-manager-for-wp-e-commerce') + '</a>.</div>', hideDelay: window.smart_manager.notificationHideDelayInMs }
							window.smart_manager.showNotification()
							return;
						}
					}
				}
				if ("undefined" === typeof (window.smart_manager.saveData) && "function" !== typeof (window.smart_manager.saveData)) {
					return;
				}
				if (1 == window.smart_manager.sm_beta_pro) {
					window.smart_manager.updatedEditedData = {};
					Object.entries(window.smart_manager.editedData).forEach(([key, value]) => {
						if (key && (false === key.includes('sm_temp_')) && (false === key.includes('null'))) {
							window.smart_manager.updatedEditedData[key] = value;
						}
					});
					let inlineUpdatedFields = new Set();
					if (Object.values(window.smart_manager.updatedEditedData).length > 0 && ("undefined" !== typeof (window.smart_manager.getColDisplayName) && "function" === typeof (window.smart_manager.getColDisplayName))) {
						Object.values(window.smart_manager.updatedEditedData).forEach((values) => {
							if (Object.keys(values).length > 0) {
								Object.keys(values).forEach((key) => {
									let editedColumnName = window.smart_manager.getColDisplayName(key);
									if (editedColumnName) {
										inlineUpdatedFields.add(editedColumnName)
									}
								});
							}
						});
					}
					window.smart_manager.processName = _x('Inline Edit', 'process name', 'smart-manager-for-wp-e-commerce');
					window.smart_manager.processContent = [...inlineUpdatedFields].join(', ');
					window.smart_manager.processCallback = window.smart_manager.saveData;
					if ("undefined" !== typeof (window.smart_manager.showTitleModal) && "function" === typeof (window.smart_manager.showTitleModal) && (inlineUpdatedFields.size > 0)) {
						window.smart_manager.showTitleModal()
					} else if (0 === inlineUpdatedFields.size) {
						window.smart_manager.saveData()
					}
				} else {
					window.smart_manager.saveData();
				}
			})

			//Code to handle the delete records functionality
			.off('click', '#sm-floating-delete-btn').on('click', '#sm-floating-delete-btn', function () {
				let isBackgroundProcessRunning = window.smart_manager.backgroundProcessRunningNotification(false);

				if (window.smart_manager.trashAndDeletePermanently.disable) {
					if (!(window.smart_manager.trashAndDeletePermanently.error_message)) {
						return false;
					}
					window.smart_manager.disableErrorMessage(window.smart_manager.trashAndDeletePermanently.error_message);
					return false;
				}

				if (window.smart_manager.selectedRows.length == 0 && !window.smart_manager.selectAll) {
					window.smart_manager.notification = { message: _x('Please select a record', 'notification', 'smart-manager-for-wp-e-commerce') }
					window.smart_manager.showNotification()
					return false;
				}

				if (window.smart_manager.sm_beta_pro == 0 && window.smart_manager.selectedRows.length > window.smart_manager.sm_deleted_successful) {
					window.smart_manager.notification = { message: _x('To delete more than', 'notification', 'smart-manager-for-wp-e-commerce') + ' ' + window.smart_manager.sm_deleted_successful + ' ' + _x('records at a time', 'notification', 'smart-manager-for-wp-e-commerce') + ', <a href="' + window.smart_manager.pricingPageURL + '" target="_blank">' + _x('upgrade to Pro', 'notification', 'smart-manager-for-wp-e-commerce') + '</a>', hideDelay: window.smart_manager.notificationHideDelayInMs }
					window.smart_manager.showNotification()
				} else if (!isBackgroundProcessRunning) {
					let isTasksView = window.smart_manager.isTasksViewActive === true;
					let recordsText = (window.smart_manager.selectAll) 
						? (window.smart_manager.isFilteredData() ? _x('all items in search results', 'modal content', 'smart-manager-for-wp-e-commerce') : _x('all', 'modal content', 'smart-manager-for-wp-e-commerce') + ' ' + window.smart_manager.dashboardDisplayName)
						: ((window.smart_manager.selectedRows.length > 1) ? _x('the selected records', 'modal content', 'smart-manager-for-wp-e-commerce') : _x('the selected record', 'modal content', 'smart-manager-for-wp-e-commerce'));
					
					window.smart_manager.showDeleteConfirmModal({
						recordsText: recordsText,
						showTrashOption: window.smart_manager.trashEnabled,
						isTasksView: isTasksView
					});
				}
				return false;
			})

			//Code for handling refresh event
			.off('click', "#refresh_sm_editor_grid").on('click', "#refresh_sm_editor_grid", function () {
				window.smart_manager.refresh();
			})

			.off('click', "#sm_editor_grid_distraction_free_mode").on('click', "#sm_editor_grid_distraction_free_mode", function () {

				if (window.smart_manager.sm_beta_pro == 1) {
					if (typeof (window.smart_manager.smToggleFullScreen) !== "undefined" && typeof (window.smart_manager.smToggleFullScreen) === "function") {
						let element = document.documentElement;
						window.smart_manager.smToggleFullScreen(element);
					}
				} else {
					window.smart_manager.notification = {
						message: sprintf(
							/* translators: %s: pricing page link */
							_x('This feature is available only in the %s version', 'modal content', 'smart-manager-for-wp-e-commerce'), '<a href="' + window.smart_manager.pricingPageURL + '" target="_blank">' + _x('Pro', 'modal content', 'smart-manager-for-wp-e-commerce') + '</a>'), hideDelay: window.smart_manager.notificationHideDelayInMs
					}
					window.smart_manager.showNotification()
				}

				window.smart_manager.hot.updateSettings({ 'width': window.smart_manager.grid_width });
				window.smart_manager.hot.render();

				jQuery('#sm_top_bar, #sm_bottom_bar').css('width', window.smart_manager.grid_width + 'px');
			})

			// Pagination navigation click events
			.off('click', "#sm_pagination_prev").on('click', "#sm_pagination_prev", function () {
				window.smart_manager.handlePageNavigation(window.smart_manager.currentPageNumber - 1);
			})
			.off('click', "#sm_pagination_next").on('click', "#sm_pagination_next", function () {
				window.smart_manager.handlePageNavigation(window.smart_manager.currentPageNumber + 1);
			})
			.off('click', ".sm-pagination-page").on('click', ".sm-pagination-page", function () {
				window.smart_manager.handlePageNavigation(parseInt(jQuery(this).data('page')));
			})

			.off('click', 'td.htDimmed').on('click', 'td.htDimmed', function () {
				if (window.smart_manager.sm_beta_pro == 0) {
					if (typeof (window.smart_manager.modifiedRows) != 'undefined') {
						if (window.smart_manager.modifiedRows.length >= window.smart_manager.sm_updated_successful) {
							alert(_x('For editing more records upgrade to Pro', 'notification', 'smart-manager-for-wp-e-commerce'));
						}
					}
				}
			})

			//Code for add record functionality
			.off('click', "#sm-add-new-btn").on('click', "#sm-add-new-btn", function () {
				window.smart_manager.modal = {
					width: 'max-width-lg',
					title: sprintf(
						/* translators: %s: dashboard display name */
						_x('New %s', 'modal title', 'smart-manager-for-wp-e-commerce'), window.smart_manager.dashboardDisplayName),
					content: `
						<div class="flex flex-col gap-[0.75rem]">
							<p class="text-[0.875rem] leading-[1.25rem] text-sm-base-muted-foreground m-0">
								${sprintf(
									/* translators: %s: dashboard display name */
									_x('Choose how many %s you want to add to the table', 'modal content', 'smart-manager-for-wp-e-commerce'), window.smart_manager.dashboardDisplayName.toLowerCase() + '(s)')}
							</p>
							<input type="number" id="sm_beta_add_record_count" min="1" value="1" class="w-full h-[2.25rem] px-[0.75rem] py-[0.5rem] border border-sm-base-input rounded-[0.5rem] bg-sm-base-background text-[0.875rem] text-sm-base-foreground" />
							<div class="mt-2 flex items-start gap-[0.5rem] text-[0.75rem] leading-[1rem] text-sm-base-muted-foreground">
								<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M7.33171 9.99831V7.33164M7.33171 4.66498H7.33837M13.9984 7.33164C13.9984 11.0135 11.0136 13.9983 7.33171 13.9983C3.64981 13.9983 0.665039 11.0135 0.665039 7.33164C0.665039 3.64975 3.64981 0.664978 7.33171 0.664978C11.0136 0.664978 13.9984 3.64975 13.9984 7.33164Z" stroke="#737373" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
								<span>${_x('These rows will be added to your table and marked as drafts until you save', 'modal note', 'smart-manager-for-wp-e-commerce')}</span>
							</div>
						</div>
					`,
					autoHide: false,
					cta: {
						title: _x('Create', 'button', 'smart-manager-for-wp-e-commerce'),
						callback: function () {
							let count = jQuery('#sm_beta_add_record_count').val();
							if (count > 0) {
								window.smart_manager.hot.alter('insert_row', 0, count);
							}
						}
					},
					closeCTA: { title: _x('Cancel', 'button', 'smart-manager-for-wp-e-commerce') }
				}
				if ((typeof window.smart_manager.dirtyRowColIds !== 'undefined') && Object.getOwnPropertyNames(window.smart_manager.dirtyRowColIds).length > 0) {
					window.smart_manager.confirmUnsavedChanges({ 'yesCallback': window.smart_manager.showModal, 'modalVals': window.smart_manager.modal, 'hideOnYes': false })
				} else if ("undefined" !== typeof (window.smart_manager.showModal) && "function" === typeof (window.smart_manager.showModal)) {
					window.smart_manager.showModal()
				}
			})

			.off('click', "#sm-create-custom-view").on('click', "#sm-create-custom-view", function (e) {
				e.preventDefault();
				jQuery('#sm-custom-views-panel').addClass('hidden');
				if (window.smart_manager.sm_beta_pro == 1) {
					if (typeof (window.smart_manager.createUpdateViewDialog) !== "undefined" && typeof (window.smart_manager.createUpdateViewDialog) === "function") {
						if ((typeof window.smart_manager.dirtyRowColIds !== 'undefined') && Object.getOwnPropertyNames(window.smart_manager.dirtyRowColIds).length > 0) {
							window.smart_manager.confirmUnsavedChanges({ 'yesCallback': window.smart_manager.createUpdateViewDialog, 'yesCallbackParams': 'create', 'hideOnYes': false })
						} else {
							let params = { dashboardChecked: true, advancedSearchChecked: (jQuery('#search_switch').is(':checked')) ? true : false };
							window.smart_manager.createUpdateViewDialog('create', params);
						}
					}
				} else {
					window.smart_manager.notification = {
						message: sprintf(_x('Custom Views available (Only in %s)', 'notification', 'smart-manager-for-wp-e-commerce'), '<a href="' + window.smart_manager.pricingPageURL + '" target="_blank">' + _x('Pro', 'notification', 'smart-manager-for-wp-e-commerce') + '</a>'), hideDelay: window.smart_manager.notificationHideDelayInMs
					}
					window.smart_manager.showNotification()
				}
			})

			.off('click', "#sm_custom_views_delete").on('click', "#sm_custom_views_delete", function (e) {
				e.preventDefault();
				if (window.smart_manager.sm_beta_pro == 1) {
					let params = {};

					params.btnParams = {}
					params.title = '<span class="sm-error-icon"><span class="dashicons dashicons-warning" style="vertical-align: text-bottom;"></span>&nbsp;' + _x('Attention!', 'modal title', 'smart-manager-for-wp-e-commerce') + '</span>';
					params.content = '<span style="font-size: 1.2em;">' + _x('This will', 'modal content', 'smart-manager-for-wp-e-commerce') + ' <span class="sm-error-icon"><strong class="text-sm-base-foreground">' + _x('delete', 'modal content', 'smart-manager-for-wp-e-commerce') + '</strong></span> ' + _x('the current view. Are you sure you want to continue?', 'modal content', 'smart-manager-for-wp-e-commerce') + '</span>';
					params.titleIsHtml = true;
					params.height = 200;

					if (typeof (window.smart_manager.deleteView) !== "undefined" && typeof (window.smart_manager.deleteView) === "function") {
						params.btnParams.yesCallbackParams = { success_msg: _x('View deleted successfully!', 'notification', 'smart-manager-for-wp-e-commerce') }
						params.btnParams.yesCallback = window.smart_manager.deleteView;
					}

					window.smart_manager.showConfirmDialog(params);
				} else {
					window.smart_manager.notification = {
						message: sprintf(
							/* translators: %s: pricing page link */
							_x('Custom Views available (Only in %s)', 'notification', 'smart-manager-for-wp-e-commerce'), '<a href="' + window.smart_manager.pricingPageURL + '" target="_blank">' + _x('Pro', 'notification', 'smart-manager-for-wp-e-commerce') + '</a>'), hideDelay: window.smart_manager.notificationHideDelayInMs
					}
					window.smart_manager.showNotification()
				}
			})

			// ========================================================================
			// FLOATING ACTION BAR EVENT HANDLERS
			// ========================================================================

			// Close button - clear selection and hide floating bar
			.off('click', '#sm-floating-bar-close').on('click', '#sm-floating-bar-close', function(e) {
				e.preventDefault();
				window.smart_manager.hideFloatingActionBar();
			})

			// Code for handling the batch update, duplicate & export functionality
			.off('click', "#sm-floating-bulk-edit-btn, #sm-floating-duplicate-btn, #sm-floating-export-btn, #sm-print-invoice-btn, #sm_navbar_export_btn .sm_beta_dropdown_content a").on('click', "#sm-floating-bulk-edit-btn, #sm-floating-duplicate-btn, #sm-floating-export-btn, #sm-print-invoice-btn, #sm_navbar_export_btn .sm_beta_dropdown_content a", function (e) {
				e.preventDefault();
				let id = jQuery(this).attr('id'),
					btnText = jQuery(this).text(),
					className = jQuery(this).attr('class') || '',
					clickedElementClassName = jQuery(e.target).attr('class') || '';
				
				if (jQuery(this).parents('div#sm-delete-btn').length > 0) return;
				if (window.smart_manager.backgroundProcessRunningNotification(false)) return;
				
				// Check selection requirement
				let skipSelectionCheck = ['sm_schedule_export_btns', 'sm_entire_store'].includes(className) || clickedElementClassName === 'sm_scheduled_bulk_edits';
				if (!skipSelectionCheck && !window.smart_manager.selectedRows.length && !window.smart_manager.selectAll && window.smart_manager.recordSelectNotification) {
					window.smart_manager.notification = { message: _x('Please select a record', 'notification', 'smart-manager-for-wp-e-commerce') };
					window.smart_manager.showNotification();
					return;
				}
				
				// Determine action type
				let isBulkEdit = ['sm-floating-bulk-edit-btn', 'sm-bulk-edit-btn'].includes(id) || jQuery(this).closest('#sm-bulk-edit-btn').length > 0;
				let isDuplicate = ['sm-floating-duplicate-btn', 'sm_beta_dup_entire_store', 'sm_beta_dup_selected'].includes(id);
				let isExport = id === 'sm-floating-export-btn' || (window.smart_manager.exportCSVActions?.includes(id));
				let isPrintInvoice = ['sm-print-invoice-btn', 'print_invoice_sm_editor_grid_btn'].includes(id);
				let isScheduledAction = ['sm_schedule_export', 'sm_manage_schedule_export'].includes(id) || clickedElementClassName === 'sm_scheduled_bulk_edits';
				
				// Helper: check for unsaved changes and execute callback
				let hasDirtyRows = () => window.smart_manager.dirtyRowColIds && Object.keys(window.smart_manager.dirtyRowColIds).length > 0;
				let executeWithDirtyCheck = (callback, params, hideOnYes = false) => {
					if (hasDirtyRows()) {
						window.smart_manager.confirmUnsavedChanges({ yesCallback: callback, yesCallbackParams: params, hideOnYes });
					} else if (typeof callback === 'function') {
						callback(params);
					}
				};
				
				// Helper: show Pro upsell notification
				let showProUpsell = (msg) => {
					window.smart_manager.notification = {
						message: sprintf(msg, '<a href="' + window.smart_manager.pricingPageURL + '" target="_blank">' + _x('Pro', 'notification', 'smart-manager-for-wp-e-commerce') + '</a>'),
						hideDelay: window.smart_manager.notificationHideDelayInMs
					};
					window.smart_manager.showNotification();
				};
				
				// Export CSV (works in both Lite and Pro)
				if (isExport) {
					executeWithDirtyCheck(window.smart_manager.getExportCsv, { params: { btnParams: {}, title: _x('Attention!', 'modal title', 'smart-manager-for-wp-e-commerce') }, id, btnText: _x('Selected Records - Visible Columns', 'modal title', 'smart-manager-for-wp-e-commerce') });
					return;
				}
				
				// Pro version
				if (window.smart_manager.sm_beta_pro == 1) {
					if (isBulkEdit) {
						executeWithDirtyCheck(window.smart_manager.showPannelDialog, window.smart_manager.bulkEditRoute);
					} else if (isDuplicate) {
						if (window.smart_manager.isTaxonomyDashboard()) {
							window.smart_manager.notification = { message: _x('Comming soon', 'notification', 'smart-manager-for-wp-e-commerce') };
							window.smart_manager.showNotification();
							return;
						}
						
						let params = { btnParams: { hideOnYes: false }, title: _x('Attention!', 'modal title', 'smart-manager-for-wp-e-commerce') };
						let duplicateBtnText = (id === 'sm-floating-duplicate-btn') ? _x('selected records', 'button', 'smart-manager-for-wp-e-commerce') : btnText;
						params.content = (window.smart_manager.dashboardKey !== 'product') ? '<p class="m-0">' + _x('This will duplicate only the records in posts, postmeta and related taxonomies.', 'modal content', 'smart-manager-for-wp-e-commerce') + '</p>' : '';
						params.content += _x('Are you sure you want to duplicate the ', 'modal content', 'smart-manager-for-wp-e-commerce') + '<strong class="text-sm-base-foreground">' + duplicateBtnText + '</strong>?';
						
						// Handle product variations
						if (id !== 'sm_beta_dup_entire_store' && window.smart_manager.dashboardKey === 'product') {
							let variationCount = 0, hasParent = false;
							(window.smart_manager.selectedRows || []).forEach(i => {
								const data = window.smart_manager?.currentDashboardData[i];
								if (data?.posts_post_parent !== undefined) {
									parseInt(data.posts_post_parent) ? variationCount++ : hasParent = true;
								}
							});
							
							if (variationCount && variationCount === window.smart_manager.selectedRows.length) {
								window.smart_manager.showNotificationDialog(_x('Note:', 'modal title', 'smart-manager-for-wp-e-commerce'),
									`<div class="text-gray-500" style="font-style: italic;">${_x('Individual variation duplication is not currently supported. Please consider submitting a', 'modal content', 'smart-manager-for-wp-e-commerce')} <a href="https://www.storeapps.org/contact-us/?utm_source=sm&utm_medium=in_app_modal&utm_campaign=feature_request" target="_blank">${_x('feature request', 'modal content', 'smart-manager-for-wp-e-commerce')}</a> ${_x('to help us prioritize this enhancement.', 'modal content', 'smart-manager-for-wp-e-commerce')}</div>`);
								return;
							} else if (variationCount && hasParent) {
								params.content += `<div class="mt-2 text-gray-500" style="font-style: italic;"><strong class="text-sm-base-foreground">${_x('Note:', 'modal title', 'smart-manager-for-wp-e-commerce')}</strong> ${_x('Product duplication applies to the parent product and all its variations collectively. Individual variations cannot be duplicated separately at this time. If this feature is important to you, please consider submitting a', 'modal content', 'smart-manager-for-wp-e-commerce')} <a href="https://www.storeapps.org/contact-us/?utm_source=sm&utm_medium=in_app_modal&utm_campaign=feature_request" target="_blank">${_x('feature request', 'modal content', 'smart-manager-for-wp-e-commerce')}</a>.</div>`;
							}
						}
						
						params.btnParams.yesCallback = window.smart_manager.duplicateRecords;
						window.smart_manager.duplicateStore = (id === 'sm_beta_dup_entire_store');
						executeWithDirtyCheck(window.smart_manager.showConfirmDialog, params);
					} else if (isPrintInvoice) {
						executeWithDirtyCheck(window.smart_manager.printInvoice);
					}
				} else {
					// Lite version - show Pro upsell
					if (isScheduledAction) {
						showProUpsell(_x('This feature is available only in the %s version', 'modal content', 'smart-manager-for-wp-e-commerce'));
					} else if (isBulkEdit) {
						/* translators: %s is a link to documentation on how to use bulk edit */
						let description = sprintf(_x('You can change/update multiple fields of the entire store OR for selected items using the Bulk Edit feature. Refer to this doc on %s or watch the video below.', 'modal description', 'smart-manager-for-wp-e-commerce'), '<a href="https://www.storeapps.org/docs/sm-how-to-use-batch-update/?utm_source=sm&utm_medium=in_app&utm_campaign=view_docs" target="_blank">' + _x('how to do bulk edit', 'modal description', 'smart-manager-for-wp-e-commerce') + '</a>');
						
						window.smart_manager.modal = {
							title: _x('Bulk Edit', 'modal title', 'smart-manager-for-wp-e-commerce') + ' - <span style="color: red;">' + _x('Biggest Time Saver', 'modal title', 'smart-manager-for-wp-e-commerce') + '</span> ' + sprintf(/* translators: %s is a link to the Pro version */
								_x('(Only in %s)', 'modal title', 'smart-manager-for-wp-e-commerce'), '<a href="' + window.smart_manager.pricingPageURL + '" target="_blank">' + _x('Pro', 'modal title', 'smart-manager-for-wp-e-commerce') + '</a>'
							),
							content: '<div><p>' + description + '</p><div><iframe width="100%" height="100%" src="https://www.youtube.com/embed/COXCuX2rFrk" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div>',
							width: 'w-2/6', autoHide: false, isFooterItemsCenterAligned: true,
							cta: { title: _x('Upgrade Now', 'button', 'smart-manager-for-wp-e-commerce'), callback: () => window.open(window.smart_manager.pricingPageURL, "_blank") }
						};
						window.smart_manager.showModal();
					} else if (isDuplicate) {
						/* translators: %s is the Pro version name */
						showProUpsell(_x('Duplicate Records (Only in %s)', 'notification', 'smart-manager-for-wp-e-commerce'));
					}
				}
			})
			.off('click', ".sm_scheduled_bulk_edits").on('click', ".sm_scheduled_bulk_edits", function (e) {
				window.open(window.smart_manager.scheduledActionAdminUrl, '_blank');
			})

			.off('mouseover', '.sm_gallery_image > img').on('mouseover', '.sm_gallery_image > img', function (e) {

				let params = {
					'current_cell_value': jQuery(this).attr('src'),
					'event': e,
					'title': ''
				};

				if (typeof (window.smart_manager.showImagePreview) !== "undefined" && typeof (window.smart_manager.showImagePreview) === "function") {
					window.smart_manager.showImagePreview(params);
				}

			})

			.off('mouseout', '.sm_gallery_image > img').on('mouseout', '.sm_gallery_image > img', function (e) {

				if (jQuery('#sm_img_preview').length > 0) {
					jQuery('#sm_img_preview').remove();
				}

			})

			// Code for handling the dropdown menu for the Duplicate and Bulk Edit button.
			.off('mouseenter', '.sm_beta_dropdown').on('mouseenter', '.sm_beta_dropdown', function () {
				jQuery(this).find('.sm_beta_dropdown_content').show();
			})

			// Code for handling the dropdown menu for the Duplicate and Bulk Edit button.
			.off('mouseleave', '.sm_beta_dropdown').on('mouseleave', '.sm_beta_dropdown', function () {
				jQuery(this).find('.sm_beta_dropdown_content').hide();
			})

			.off("click", ".sm_click_to_copy").on("click", ".sm_click_to_copy", function () {
				let temp = jQuery("<input>");
				jQuery("body").append(temp);
				temp.val(jQuery(this).html()).select();
				document.execCommand("copy");
				temp.remove();
			})
			.off("change", "#sm_show_tasks_lbl").on("change", "#sm_show_tasks_lbl", function () {
				jQuery('#sm_editor_grid').trigger('sm_show_tasks_change');
				if (0 == window.smart_manager.sm_beta_pro) {
					jQuery("#sm_show_tasks").prop('checked', false);
					window.smart_manager.notification = {
						message: sprintf(
							/* translators: %s: pricing page link */
							_x('This feature is available only in the %s version', 'modal content', 'smart-manager-for-wp-e-commerce'), '<a href="' + window.smart_manager.pricingPageURL + '" target="_blank">' + _x('Pro', 'modal content', 'smart-manager-for-wp-e-commerce') + '</a>'), hideDelay: window.smart_manager.notificationHideDelayInMs
					}
					window.smart_manager.showNotification()
				}
			})
			.off('click', '.sm-column-title-editor-icon').on('click', '.sm-column-title-editor-icon', function (e) {
				if (window.smart_manager.sm_beta_pro == 1 && 'undefined' !== typeof (window.smart_manager.displayColumnTitleEditor) && 'function' === typeof (window.smart_manager.displayColumnTitleEditor)) {
					window.smart_manager.displayColumnTitleEditor(e);
				} else {
					window.smart_manager.notification = {
						message: sprintf(
							/* translators: %s: pricing page link */
							_x('This feature is available only in the %s version', 'modal content', 'smart-manager-for-wp-e-commerce'), '<a href="' + window.smart_manager.pricingPageURL + '" target="_blank">' + _x('Pro', 'modal content', 'smart-manager-for-wp-e-commerce') + '</a>'), hideDelay: window.smart_manager.notificationHideDelayInMs
					}
					window.smart_manager.showNotification()
				}
			})
			//Code to handle access privilege settings
			.off('click', '#sm_access_privilege_settings').on('click', '#sm_access_privilege_settings', function (e) {
				e.preventDefault();
				if (0 == window.smart_manager.sm_beta_pro) {
					window.smart_manager.notification = { message: sprintf(_x('This feature is available only in the %s version', 'modal content', 'smart-manager-for-wp-e-commerce'), '<a href="' + window.smart_manager.pricingPageURL + '" target="_blank">' + _x('Pro', 'modal content', 'smart-manager-for-wp-e-commerce') + '</a>'), hideDelay: window.smart_manager.notificationHideDelayInMs }
					window.smart_manager.showNotification()
					return false;
				}
				if (typeof (window.smart_manager.showPannelDialog) !== "undefined" && typeof (window.smart_manager.showPannelDialog) === "function") {
					window.smart_manager.showPannelDialog(window.smart_manager.privilegeSettingsRoute)
				}
			})
			//Code to handle the general settings
			.off('click', '#sm_nav_bar_settings_btn').on('click', '#sm_nav_bar_settings_btn', function (e) {
				e.preventDefault();
				if (typeof (window.smart_manager.showPannelDialog) !== "undefined" && typeof (window.smart_manager.showPannelDialog) === "function") {
					window.smart_manager.showPannelDialog(window.smart_manager.settingsRoute)
				}
			})
			//Code to handle the history button click to show/hide tasks dashboard
			.off('click', '#sm_navbar_history_btn').on('click', '#sm_navbar_history_btn', function (e) {
				e.preventDefault();
				if (0 == window.smart_manager.sm_beta_pro) {
					window.smart_manager.notification = {
						message: sprintf(
							/* translators: %s: pricing page link */
							_x('This feature is available only in the %s version', 'modal content', 'smart-manager-for-wp-e-commerce'), '<a href="' + window.smart_manager.pricingPageURL + '" target="_blank">' + _x('Pro', 'modal content', 'smart-manager-for-wp-e-commerce') + '</a>'), hideDelay: window.smart_manager.notificationHideDelayInMs
					}
					window.smart_manager.showNotification();
					return;
				}
				// Toggle tasks view using state variable
				window.smart_manager.toggleTasksView();
			})
			//Code to handle back button click from tasks view
			.off('click', '#sm_tasks_back_btn').on('click', '#sm_tasks_back_btn', function (e) {
				e.preventDefault();
				window.smart_manager.toggleTasksView(false);
			})
			jQuery(document).on('click', '#sm_floating_save_bar .save-btn', function () {
				jQuery('#sm-save-btn').trigger('click');
				jQuery('.sm-notification-close').trigger('click');
			})
			jQuery(document).on('click', '#sm_floating_save_bar .close-btn', function () {
				jQuery('.sm-notification-close').trigger('click');
				window.smart_manager.dirtyRowColIds = {};
				window.smart_manager.getData();
			})

		jQuery(document).trigger('sm_event_handler');
	}
	//Function to equalize the enabled and disabled section height in column visibility dialog
	SmartManager.prototype.columnVisibilityEqualizeHeight = function () {
		let enabledHeight = jQuery('#sm-columns-enabled').height(),
			disabledHeight = jQuery('#sm-columns-disabled').height(),
			maxHeight = enabledHeight > disabledHeight ? enabledHeight : disabledHeight;

		if (maxHeight > 0) {
			jQuery('#sm-columns-enabled, #sm-columns-disabled').height(maxHeight);
		}
	}

	//Function to process search for unorder list of items from 'Column Manager' and Multilist field like 'Category' in inline edit
	SmartManager.prototype.processListSearch = function (eventObj) {
		let searchString = jQuery(eventObj).val(),
			ulId = jQuery(eventObj).attr('data-ul-id');
		if ('' !== ulId) {
			jQuery("#" + ulId).find('li').each(function () {
				let txtValue = jQuery(this).find('.sm-title-input').val();
				let isMatch = txtValue.toUpperCase().indexOf(searchString.toUpperCase()) > -1;
				(isMatch) ? jQuery(this).css("display", "block") : jQuery(this).hide();
				// Ensure that if a child is visible, its parent remains visible
				let isChildVisible = jQuery(this).find('li:visible').length > 0;
				let isMatched = ('none' !== jQuery(this).css('display'));
				if (isChildVisible || isMatched) {
					jQuery(this).css("display", "block").parents('ul, li').css("display", "block");
				}
			});
		}
	};

	//Function to create column Visibility dialog
	SmartManager.prototype.createColumnVisibilityDialog = function () {
		if ('undefined' === typeof (window.smart_manager.currentColModel)) {
			return;
		}
		let enabledColumnsArray = new Array(),
			hiddenColumnsArray = new Array(),
			colText = '',
			colVal = '',
			temp = '',
			panelContent = '';

		for (let key in window.smart_manager.currentColModel) {

			colObj = window.smart_manager.currentColModel[key];

			if (!colObj.hasOwnProperty('data')) {
				continue;
			}

			if (colObj.hasOwnProperty('allow_showhide') && true === colObj.allow_showhide) {

				colText = (colObj.hasOwnProperty('name_display')) ? colObj.name_display : '';
				colVal = (colObj.hasOwnProperty('data')) ? colObj.data : '';
				colPosition = (colObj.hasOwnProperty('position')) ? ((colObj.position != '') ? colObj.position - 1 : '') : '';


				temp = `<li>
						<span class="handle">::</span>
						<input type="text" class="sm-title-input" title="${colText}" value="${colText}" readonly />
						<span class="handle sm-column-title-editor-icon">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"></path>
							</svg>
						</span>
						<input type="hidden" name="columns[]" class="js-column-key" value="${colVal}">
						<input type="hidden" name="columns_names[]" class="js-column-title" value="${colText}">
					</li>`;

				if (colObj.hasOwnProperty('hidden') && false === colObj.hidden) {
					enabledColumnsArray.push(temp);
				} else if (colObj.hasOwnProperty('hidden') && true === colObj.hidden) {
					hiddenColumnsArray.push(temp);
				}
			}
		}

		if ("undefined" !== typeof (window.smart_manager.processColumnVisibility) && "function" === typeof (window.smart_manager.processColumnVisibility)) {
			window.smart_manager.processColumnVisibility;
		}

		if ("undefined" !== typeof (window.smart_manager.columnVisibilityEqualizeHeight) && "function" === typeof (window.smart_manager.columnVisibilityEqualizeHeight)) {
			window.smart_manager.columnVisibilityEqualizeHeight();
		}

		let $columns = document.getElementById('sm-columns-enabled'),
			$columnsDisabled = document.getElementById('sm-columns-disabled');

		window.smart_manager.enabledSortable = Sortable.create($columns, {
			group: 'smartManagerColumns',
			animation: 100,
			onSort: function (evt) {
				if ("undefined" !== typeof (window.smart_manager.columnsMoved) && "function" === typeof (window.smart_manager.columnsMoved)) {
					window.smart_manager.columnsMoved();
				}
			}
		});
		window.smart_manager.disabledSortable = Sortable.create($columnsDisabled, {
			group: 'smartManagerColumns',
			animation: 100
		});
	}

	//Function to block Bulk Edit/Duplicate Records/Delete Records functionality when background process is running
	SmartManager.prototype.backgroundProcessRunningNotification = function (isBackgroundProcessRunning = false) {
		isBackgroundProcessRunning = ("undefined" !== typeof (window.smart_manager.isBackgroundProcessRunning) && "function" === typeof (window.smart_manager.isBackgroundProcessRunning)) ? window.smart_manager.isBackgroundProcessRunning() : false;
		if (isBackgroundProcessRunning) {
			window.smart_manager.notification = { message: window.smart_manager.backgroundProcessRunningMessage, hideDelay: window.smart_manager.notificationHideDelayInMs }
			window.smart_manager.showNotification()
		}
		return isBackgroundProcessRunning;
	}

	//Function to update the list of enabled columns on column move event
	SmartManager.prototype.columnsMoved = function () {
		let enabled = jQuery('#sm-column-visibility').find('.columns-enabled .js-column-key');
		let allEnabled = enabled.map(function () {
			return jQuery(this).val();
		}).get().join(',');
		jQuery('#sm-column-visibility').find('#sm-all-enabled-columns').val(allEnabled);
		window.smart_manager.columnsVisibilityUsed = true;
	}

	//Function to load the updated list of enabled columns in the grid
	SmartManager.prototype.processColumnVisibility = function () {
		if (false === window.smart_manager.columnsVisibilityUsed && Object.keys(window.smart_manager.editedColumnTitles).length == 0) {
			return false;
		}

		let enabledColumns = jQuery('#sm-column-visibility').find('#sm-all-enabled-columns').val();

		if ('undefined' === typeof (enabledColumns) || 'undefined' === typeof (window.smart_manager.currentColModel)) {
			return;
		}

		if (enabledColumns.length > 0) {

			// let idKey = ( window.smart_manager.dashboardKey == 'user' ) ? 'users_id' : 'posts_id';
			// enabledColumns = idKey + ',' + enabledColumns;

			let enabledColumnsArray = enabledColumns.split(','),
				colVal = '',
				position = 0;

			window.smart_manager.column_names = [];
			window.smart_manager.currentVisibleColumns = [];

			for (let key in window.smart_manager.currentColModel) {

				colObj = window.smart_manager.currentColModel[key];

				if (colObj.hasOwnProperty('allow_showhide') && true === colObj.allow_showhide) {
					colVal = (colObj.hasOwnProperty('data')) ? colObj.data : '';

					if (enabledColumnsArray.indexOf(colVal) != -1) {

						position = enabledColumnsArray.indexOf(colVal) + 1;

						window.smart_manager.currentColModel[key].hidden = false; //Code for refreshing the column visibility
						window.smart_manager.currentColModel[key].position = position; //Code for refreshing the column position

					} else {
						window.smart_manager.currentColModel[key].hidden = true;
					}
				}
			}

			if ("undefined" !== typeof (window.smart_manager.sortColumns) && "function" === typeof (window.smart_manager.sortColumns)) {
				window.smart_manager.sortColumns();
			}
		}

		if (enabledColumns.length > 0 || Object.keys(window.smart_manager.editedColumnTitles).length > 0) {

			let index = 0;

			window.smart_manager.currentColModel.forEach(function (colObj) {

				let hidden = ('undefined' !== typeof (colObj.hidden)) ? colObj.hidden : true,
					data = (colObj.hasOwnProperty('data')) ? colObj.data : '';

				// COde for updating the column titles
				if (Object.keys(window.smart_manager.editedColumnTitles).length > 0 && data && window.smart_manager.editedColumnTitles.hasOwnProperty(data)) {
					colObj.name = colObj.key = colObj.name_display = window.smart_manager.editedColumnTitles[data]
				}

				if (false === hidden) {
					if (false === colObj.hasOwnProperty('name_display')) {// added for state management
						colObj.name_display = name;
					}
					let name = ('undefined' !== typeof (colObj.name)) ? colObj.name.trim() : '';

					window.smart_manager.column_names[index] = colObj.name_display; //Array for column headers
					window.smart_manager.currentVisibleColumns[index] = colObj;

					index++;
				}
			});

			//code to trigger update state ajax call
			if ("undefined" !== typeof (window.smart_manager.updateState) && "function" === typeof (window.smart_manager.updateState)) {
				let params = { refreshDataModel: true, async: true };
				if (window.smart_manager.isViewAuthor) {
					params.updateView = true
				}
				window.smart_manager.isColumnModelUpdated = true
				params.isTasksEnabled = window.smart_manager.isTasksEnabled()
				window.smart_manager.showLoader();
				window.smart_manager.updateState(params); //refreshing the dashboard states

				if ("undefined" !== typeof (window.smart_manager.refreshColumnsTitleAttribute) && "function" === typeof (window.smart_manager.refreshColumnsTitleAttribute)) {
					setTimeout(() => {
						window.smart_manager.refreshColumnsTitleAttribute();
					}, 1000);
				}
			}
		}
	}

	SmartManager.prototype.sortColumns = function () {
		if (typeof window.smart_manager.currentColModel == 'undefined') {
			return;
		}
		window.smart_manager.indexPointer = 0;
		let enabledColumns = new Array(),
			disabledColumns = new Array();
		enabledColumnsFinal = new Array();
		window.smart_manager.currentColModel.forEach(function (colObj) {
			enabled = 0;
			if (colObj.hasOwnProperty('position') != false && colObj.hasOwnProperty('hidden') != false) {
				if (colObj.position != '' && colObj.hidden === false) {
					enabledColumns[colObj.position] = colObj;
					enabled = 1;
				}
			}
			if (enabled == 0) {
				disabledColumns.push(colObj);
			}
		});
		enabledColumns.forEach(function (colObj) { //done this to re-index the array for proper array length
			enabledColumnsFinal.push(colObj);
		});
		enabledColumnsFinal.sort(function (a, b) {
			return parseInt(a.position) - parseInt(b.position);
		});
		window.smart_manager.currentColModel = enabledColumnsFinal.concat(disabledColumns);
	}

	SmartManager.prototype.formatDashboardColumnModel = function (column_model) {
		SaCommonManager.prototype.formatDashboardColumnModel.call(this, column_model);
		if (window.smart_manager.currentColModel == '' || typeof (window.smart_manager.currentColModel) == 'undefined') {
			return;
		}
		if (typeof (window.smart_manager.sortColumns) !== "undefined" && typeof (window.smart_manager.sortColumns) === "function") {
			window.smart_manager.sortColumns();
		}
		for (i = 0; i < window.smart_manager.currentColModel.length; i++) {
			window.smart_manager.currentColModel[i].wordWrap = true;
		}
		jQuery('#sm_editor_grid').trigger('smart_manager_post_format_columns'); //custom trigger
	}

	//Function to get the seleted IDs
	SmartManager.prototype.getSelectedKeyIds = function () {
		let idKey = window.smart_manager.getKeyID(),
			selectedIds = [];
		window.smart_manager.selectedRows.forEach((rowId) => {
			selectedIds.push(window.smart_manager.currentDashboardData[rowId][idKey]);
		})
		return selectedIds;
	}
	//Function to show columns menu

	SmartManager.prototype.refreshIsViewAuthor = function (viewSlug) {
		let params = {};
		params.data_type = 'json';
		params.data = {
			cmd: 'is_view_author',
			module: 'custom_views',
			active_module: viewSlug,
			security: window.smart_manager.saCommonNonce,
			slug: viewSlug,
		};
		window.smart_manager.sendRequest(params, function (response) {
			window.smart_manager.isViewAuthor = (response) ? true : false
			window.smart_manager.displayShowHideColumnSettings(response);
		});
	}

	//Function to delete records
	SmartManager.prototype.deleteRecords = function () {

		if (window.smart_manager.selectedRows.length == 0 && !window.smart_manager.selectAll) {
			return;
		}

		let params = {};
		params.data = {
			cmd: 'delete',
			active_module: window.smart_manager.dashboardKey,
			security: window.smart_manager.saCommonNonce,
			ids: JSON.stringify(window.smart_manager.getSelectedKeyIds())
		};

		window.smart_manager.sendRequest(params, function (response) {
			if ('failed' !== response) {
				jQuery('#sm-delete-btn').addClass('sm-ui-state-disabled');
				window.smart_manager.refresh();
				window.smart_manager.notification = { status: 'success', message: response }
				window.smart_manager.showNotification()
			}
		});
	}

	SmartManager.prototype.updateLitePromoMessage = function (countRows) {
		let count = parseInt(countRows);
		if (count >= 2) {
			jQuery('.sm_design_notice .sm_sub_headline.action').hide();
			jQuery('.sm_design_notice .sm_sub_headline.response').show();
		}
	}

	//Function to save inline edited data
	SmartManager.prototype.saveData = function () {
		if (Object.getOwnPropertyNames(window.smart_manager.editedData).length <= 0) {
			return;
		}
		let params = {};
		params.data = {
			cmd: 'inline_update',
			active_module: window.smart_manager.dashboardKey,
			edited_data: JSON.stringify(window.smart_manager.editedData),
			security: window.smart_manager.saCommonNonce,
			pro: ((typeof (window.smart_manager.sm_beta_pro) != 'undefined') ? window.smart_manager.sm_beta_pro : 0),
			table_model: (window.smart_manager.currentDashboardModel.hasOwnProperty('tables')) ? window.smart_manager.currentDashboardModel.tables : '',
			is_advanced_search: jQuery('#search_switch').is(':checked')
		};
		params.data = ("undefined" !== typeof (window.smart_manager.addTasksParams) && "function" === typeof (window.smart_manager.addTasksParams) && 1 == window.smart_manager.sm_beta_pro) ? window.smart_manager.addTasksParams(params.data) : params.data;
		let hasInvalidClass = jQuery('.sm-grid-dirty-cell').hasClass('htInvalid');
		if (hasInvalidClass == false) {
			window.smart_manager.sendRequest(params, function (response) {
				if ('failed' !== response) {
					let title = 'success'
					if (window.smart_manager.isJSON(response)) {
						response = JSON.parse(response);
						msg = response.msg;
						if(response?.show_feedback){
							window[pluginKey].showFeedbackModal()
						}
					} else {
						msg = response;
					}
					if (('undefined' === typeof (window.smart_manager.sm_beta_pro) || ('undefined' !== typeof (window.smart_manager.sm_beta_pro) && 1 != window.smart_manager.sm_beta_pro))) {
						if (typeof (response.sm_inline_update_count) != 'undefined') {
							if ("undefined" !== typeof (window.smart_manager.updateLitePromoMessage) && "function" === typeof (window.smart_manager.updateLitePromoMessage)) {
								window.smart_manager.updateLitePromoMessage(response.sm_inline_update_count);
							}
						}
					}
					if (window.smart_manager.editedCellIds.length > 0) {
						for (let i = 0; i < window.smart_manager.editedCellIds.length; i++) {
							colProp = window.smart_manager.hot.getCellMeta(window.smart_manager.editedCellIds[i].row, window.smart_manager.editedCellIds[i].col);
							currentClassName = (colProp.hasOwnProperty('className')) ? colProp.className : '';
							if (currentClassName.indexOf('sm-grid-dirty-cell') != -1) {
								currentClassName = currentClassName.substr(0, currentClassName.indexOf('sm-grid-dirty-cell'));
							}
							window.smart_manager.hot.setCellMeta(window.smart_manager.editedCellIds[i].row, window.smart_manager.editedCellIds[i].col, 'className', currentClassName);
							jQuery('.smCheckboxColumnModel input[data-row=' + window.smart_manager.editedCellIds[i].row + ']').parents('tr').removeClass('sm_edited');
						}
						// Code to get modified page nos.
						window.smart_manager.dirtyRowColIds = {};
						window.smart_manager.editedData = {};
						window.smart_manager.modifiedRows = new Array();
						window.smart_manager.getData({ refreshPage: window.smart_manager.currentPageNumber });
						window.smart_manager.isRefreshingLoadedPage = false;
					}
					window.smart_manager.hot.render();
					if (('undefined' !== typeof (window.smart_manager.sm_beta_pro) && 1 != window.smart_manager.sm_beta_pro) &&
						(response.hasOwnProperty('modal_message') && response.modal_message.trim() !== '') &&
						sm_beta_params.hasOwnProperty('manHoursData') && ('success' === title)) {
						window.smart_manager.showManHoursSaved({ message: response.modal_message, title: msg });
					} else {
						window.smart_manager.notification = { message: msg }
						if ('success' === title) {
							window.smart_manager.notification.status = title
						}
						window.smart_manager.showNotification()
					}
				}
			});
		} else {
			window.smart_manager.notification = { status: 'error', message: _x('You have entered incorrect data in the highlighted cells.', 'notification', 'smart-manager-for-wp-e-commerce') }
			window.smart_manager.showNotification()
		}
	}

	SmartManager.prototype.hideNotificationDialog = function () {
		jQuery("#sm_inline_dialog").dialog("close");
	}

	//Function to show notification messages
	SmartManager.prototype.showNotificationDialog = function (title = '', content = '', dlgparams = {}) {

		window.smart_manager.modal = {
			title: (title) ? title : _x('Note', 'modal title', 'smart-manager-for-wp-e-commerce'),
			content: (content) ? content : sprintf(
				/* translators: %s: pricing page link */
				_x('This feature is available only in the %s version', 'modal content', 'smart-manager-for-wp-e-commerce'), '<a href="' + window.smart_manager.pricingPageURL + '" target="_blank">' + _x('Pro', 'modal content', 'smart-manager-for-wp-e-commerce') + '</a>'),
			autoHide: (dlgparams.hasOwnProperty('autoHide')) ? dlgparams.autoHide : false
		}
		window.smart_manager.showModal()
	}

	//Function to show confirm dialog
	SmartManager.prototype.showConfirmDialog = function (params) {

		window.smart_manager.modal = {
			title: (params.hasOwnProperty('title') !== false && params.title != '') ? params.title : _x('Warning', 'modal title', 'smart-manager-for-wp-e-commerce'),
			content: (params.hasOwnProperty('content') !== false && params.content != '') ? params.content : _x('Are you sure?', 'modal content', 'smart-manager-for-wp-e-commerce'),
			autoHide: false,
			showCloseIcon: (params.hasOwnProperty('showCloseIcon')) ? params.showCloseIcon : true,
			modalClass: params?.modalClass || '',
			showCloseCTAFirst: params.showCloseCTAFirst,
			cta: {
				title: ((params.btnParams.hasOwnProperty('yesText')) ? params.btnParams.yesText : _x('Yes', 'button', 'smart-manager-for-wp-e-commerce')),
				closeModalOnClick: (params.btnParams.hasOwnProperty('hideOnYes')) ? params.btnParams.hideOnYes : true,
				btnClass: (params.btnParams.hasOwnProperty('yesBtnClass')) ? params.btnParams.yesBtnClass : '',
				callback: function () {
					if (params.btnParams.hasOwnProperty('yesCallback') && typeof params.btnParams.yesCallback === "function") {
						if (params.btnParams.hasOwnProperty('yesCallbackParams')) {
							params.btnParams.yesCallback(params.btnParams.yesCallbackParams);
						} else {
							params.btnParams.yesCallback();
						}
					}
				}
			},
			closeCTA: {
				title: ((params.btnParams.hasOwnProperty('noText')) ? params.btnParams.noText : _x('No', 'button', 'smart-manager-for-wp-e-commerce')),
				btnClass: (params.btnParams.hasOwnProperty('noBtnClass')) ? params.btnParams.noBtnClass : '',
				callback: function () {
					if (params.btnParams.hasOwnProperty('noCallback') && typeof params.btnParams.noCallback === "function") {
						params.btnParams.noCallback();
					}
				}
			},
			route: params?.route || false
		}
		if(params.hasOwnProperty('modalWidth') && params.modalWidth){
			window.smart_manager.modal.width = params.modalWidth
		}
		window.smart_manager.showModal()
	}

	SmartManager.prototype.getCurrentDashboardState = function () {
		let tempDashModel = JSON.parse(JSON.stringify(window.smart_manager.currentDashboardModel));
		let tempColModel = JSON.parse(JSON.stringify(window.smart_manager.currentColModel));

		if (!Array.isArray(tempColModel)) {
			tempColModel = []
		}

		tempDashModel.columns = new Array();
		tempColModel.forEach(function (colObj) {
			if (typeof (colObj.hidden) != 'undefined' && colObj.hidden === false) {
				tempDashModel.columns.push(colObj);
			}
		});
		let dashboardState = { 'columns': tempDashModel.columns, 'sort_params': tempDashModel.sort_params };
		let viewSlug = window.smart_manager.getViewSlug(window.smart_manager.dashboardName);
		if (viewSlug) {
			dashboardState['search_params'] = {
				'isAdvanceSearch': ((window.smart_manager.advancedSearchQuery.length > 0) ? 'true' : 'false'),
				'params': ((window.smart_manager.advancedSearchQuery.length > 0) ? window.smart_manager.advancedSearchQuery : window.smart_manager.simpleSearchText)
			}
		}
		return JSON.stringify(dashboardState);
	}

	SmartManager.prototype.refreshDashboardStates = function () {
		window.smart_manager.dashboardStates[window.smart_manager.dashboardKey] = window.smart_manager.getCurrentDashboardState();
	}

	//Function to handle the state apply at regular intervals
	SmartManager.prototype.updateState = function (refreshParams = {}) {
		let viewSlug = window.smart_manager.getViewSlug(window.smart_manager.dashboardName);
		if (1 == window.smart_manager.sm_beta_pro && viewSlug && !refreshParams.updateView) { //Added for skipping `save_state` when simply switching from custom views dashboards
			window.smart_manager.refresh();
			return;
		}
		// do not refresh the states if view
		if ("undefined" !== typeof (window.smart_manager.refreshDashboardStates) && "function" === typeof (window.smart_manager.refreshDashboardStates)) {
			window.smart_manager.refreshDashboardStates(); //refreshing the dashboard states
		}
		if (Object.getOwnPropertyNames(window.smart_manager.dashboardStates).length <= 0) {
			return;
		}
		//Ajax request to update the dashboard states
		let params = {};
		params.data_type = 'json';
		params.data = {
			cmd: 'save_state',
			security: window.smart_manager.saCommonNonce,
			active_module: window.smart_manager.dashboardKey,
			dashboard_states: window.smart_manager.prepareMultilistConfigForSave(window.smart_manager.dashboardStates)
		};
		// Code for passing extra param for view handling
		if (1 == window.smart_manager.sm_beta_pro) {
			params.data['is_view'] = 0;
			if (viewSlug && (refreshParams.updateView || false)) {
				params.data['is_view'] = 1;
				params.data['active_module'] = viewSlug;
			}
			// Flag for handling taxonomy dashboards
			params.data['is_taxonomy'] = window.smart_manager.isTaxonomyDashboard();
			// code for handling tasks of the current dashboard
			if (refreshParams && 'undefined' !== typeof (refreshParams.isTasksEnabled) && parseInt(refreshParams.isTasksEnabled)===1) {
				params.data['isTasks'] = refreshParams.isTasksEnabled;
			}
			// Code for handling renaming of columns
			if (Object.keys(window.smart_manager.editedColumnTitles).length > 0) {
				params.data['edited_column_titles'] = window.smart_manager.editedColumnTitles;
			}
		}
		params.showLoader = false;
		if (refreshParams && 'undefined' !== typeof (refreshParams.async)) {
			params.async = refreshParams.async;
		}
		window.smart_manager.sendRequest(params, function (refreshParams, response) {
			window.smart_manager.dashboardStates = {};
			if (refreshParams) {
				if ('undefined' !== typeof (refreshParams.refreshDataModel)) {
					window.smart_manager.refresh();
				}
			}
		}, refreshParams);
	}

	//Prepare multilist column config before saving by removing unwanted search and values data.
	SmartManager.prototype.prepareMultilistConfigForSave = function (data = {}) {
		// If data is invalid → return as it is
		if (data === null || data === undefined) {
			return data;
		}
		// Case 1: Array of strings
		if (Array.isArray(data)) {
			return data.map(function(item) {
				return window.smart_manager.removeSearchValuesFromMultilist(item);
			});
		}
		// Case 2: Plain string
		if (typeof data === 'string') {
			return window.smart_manager.removeSearchValuesFromMultilist(data);
		}
		// Case 3: Object with key:value
		if (typeof data === 'object') {
			const updated = {};
			Object.keys(data).forEach(function(key){
				updated[key] = window.smart_manager.removeSearchValuesFromMultilist(data[key]);
			});
			return updated;
		}
		// Otherwise return unchanged
		return data;
	};

	//Removes values/search_values from columns of type `sm.multilist`.
	SmartManager.prototype.removeSearchValuesFromMultilist = function(value) {
		// If empty or not a string → return original
		if (typeof value !== 'string' || value.trim() === '') {
			return value;
		}

		let parsed;
		// Try parsing JSON
		try {
			parsed = JSON.parse(value);
		} catch (err) {
			return value; // Invalid JSON, return original
		}

		// If parsed JSON contains the expected structure
		if (parsed && parsed.columns && Array.isArray(parsed.columns)) {
			parsed.columns.forEach(function(column) {
				if (column && column.hasOwnProperty('type') && column.type === 'sm.multilist') {
					['search_values', 'values'].forEach(function(field) {
						if (Object.prototype.hasOwnProperty.call(column, field)) {
							column[field] = [];
						}
					});

				}
			});
		}
		return JSON.stringify(parsed);
	}

	// Function to determine if the selected dashhboard is a taxonomy dashboard or not
	SmartManager.prototype.isTaxonomyDashboard = function () {
		let viewSlug = window.smart_manager.getViewSlug(window.smart_manager.dashboardName);
		return (window.smart_manager.allTaxonomyDashboards[(window.smart_manager.viewPostTypes.hasOwnProperty(viewSlug)) ? window.smart_manager.viewPostTypes[viewSlug] : window.smart_manager.dashboardKey]) ? 1 : 0
	}

	// Function to get keyId for the dashboard
	SmartManager.prototype.getKeyID = function () {
		let ordersPostTypes = ['shop_order', 'shop_subscription'];
		switch (true) {
			case ("undefined" !== typeof (window.smart_manager.isTasksEnabled) && "function" === typeof (window.smart_manager.isTasksEnabled) && (1 === window.smart_manager.isTasksEnabled()) || ('product_stock_log' === window.smart_manager.dashboardKey)):
				return 'sm_tasks_id'
			case (('undefined' !== typeof window.smart_manager.taxonomyDashboards[window.smart_manager.dashboardKey]) || (('undefined' !== typeof window.smart_manager.viewPostTypes[window.smart_manager.dashboardKey]) && (('undefined' !== typeof window.smart_manager.taxonomyDashboards[window.smart_manager.viewPostTypes[window.smart_manager.dashboardKey]])))):
				return 'terms_term_id'
			case ('user' === window.smart_manager.dashboardKey):
				return 'users_id'
			case ((ordersPostTypes.includes(window.smart_manager.dashboardKey) || ordersPostTypes.includes(window.smart_manager.viewPostTypes[window.smart_manager.dashboardKey])) && ("undefined" !== typeof (window.smart_manager.sm_is_woo79)) && ('true' === window.smart_manager.sm_is_woo79)):
				return 'wc_orders_id'
			default:
				return 'posts_id';
		}
	}

	// Function to save settings
	SmartManager.prototype.saveSettings = function (settings = {}, settingsDialogObj = {}) {
		if (0 == Object.keys(settings).length || (0 < Object.keys(settings).length && !settings.hasOwnProperty('general'))) {
			return;
		}
		let params = {};
		params.data = {
			cmd: 'save_settings',
			active_module: 'smart_manager_settings',
			settings: JSON.stringify(settings),
			security: window.smart_manager.saCommonNonce,
			pro: ('undefined' !== typeof (window.smart_manager.sm_beta_pro)) ? window.smart_manager.sm_beta_pro : 0
		};
		params.data_type = 'json'
		window.smart_manager.sendRequest(params, function (response) {
			let ack = (response.hasOwnProperty('ACK')) ? response.ACK : ''
			if ('Success' === ack) {
				settingsDialogObj.closeDialog();
				window.smart_manager.notification = {
					status: 'success', message:
						_x('Settings saved successfully!', 'notification', 'smart-manager-for-wp-e-commerce')
				}
				window.smart_manager.showNotification()
				setTimeout(function () {
					location.reload();
				}, 2000);
			}
			if ('Failure' === ack && response.hasOwnProperty('msg')) {
				window.smart_manager.notification = {message: response.msg, route: 'settings'}
				window[pluginKey].showPannelDialog('settings')
			}
		});
	};

	// Function to change export CSV button text.
	SmartManager.prototype.exportButtonHtml = function () {
		if (document.getElementById('sm_export_csv') !== null) {
			document.getElementById('sm_export_csv').innerHTML = `
		<a id="sm_export_entire_store" class="sm_entire_store" href="#">${_x('Entire Store', 'export button', 'smart-manager-for-wp-e-commerce')}</a>
		${window.smart_manager.current_selected_dashboard === 'shop_order'?`
			<a id="sm_schedule_export" class="sm_schedule_export_btns" href="#">${_x('Schedule Export', 'schedule export button', 'smart-manager-for-wp-e-commerce')}</a>
			<a id="sm_manage_schedule_export" class="sm_schedule_export_btns" target="_blank" href="${window.smart_manager?.scheduledExportActionAdminUrl || ''}">${_x('Manage Scheduled Exports', 'manage scheduled exports button', 'smart-manager-for-wp-e-commerce')}</a>`:''
		}`;
		}
	}

	//Function to find navbar dashboard select2 parent or child elements based on matching text.
	SmartManager.prototype.findSelect2ParentOrChildByText = function (ParentOrChildText = '', matchExactChild = false) {
		if ((!ParentOrChildText) || (typeof ParentOrChildText === 'undefined') || (ParentOrChildText.length === 0) || (!window.smart_manager.hasOwnProperty('dashboardSelect2Items'))) {
			return false;
		}
		ParentOrChildText = ParentOrChildText.trim().toLowerCase();
		let parentID = window.smart_manager.dashboardSelect2Items.find((item) => { return item.text.trim().toLowerCase().startsWith(ParentOrChildText) })?.id;
		let childID = '';
		let childText = '';
		// If matching parent is not found, search within children.
		if ((!parentID) || (typeof parentID === 'undefined') || (parentID.length === 0)) {
			window.smart_manager.dashboardSelect2Items.some((item) => {
				let matchingChild = item.children.find((child) => {
					if (matchExactChild) {
						if ((child.id === ParentOrChildText) || (child.text === ParentOrChildText)) {
							childID = child.id;
							childText = child.text;
							return true;
						}
					} else {
						if ((child.text.trim().toLowerCase().includes(ParentOrChildText)) || (child.id.includes(ParentOrChildText.toLowerCase()))) {
							childID = child.id;
							childText = child.text;
							return true;
						}
					}
					return false;
				});
				if (matchingChild) {
					parentID = item.id;
					return true;
				}
				return false;
			});
		}
		return { parentID, childID, childText };
	}

	//Function to Check if a saved search with a specific slug exists.
	SmartManager.prototype.findSavedSearchBySlug = function (slug = "") {
		if ((parseInt(window.smart_manager.sm_beta_pro) !== 1) || (!window.smart_manager.hasOwnProperty("savedSearches")) || (!Array.isArray(window.smart_manager.savedSearches)) || (!slug.length)) {
			return false;
		}
		return (window.smart_manager.savedSearches.find((item) => item.hasOwnProperty("slug") && item.slug === slug) || false);
	}

	SmartManager.prototype.hideElementOnClickOutside = function (event = {}, elementId = "") {
		if (!event || typeof event !== "object" || !event.target || !elementId) {
			return;
		}
		let element = document.getElementById(elementId);
		if (!element) {
			return;
		}
		if (!element.contains(event.target)) {
			element?.classList?.add("hidden")
		}
	};

	// Function to display disable error message.
	SmartManager.prototype.disableErrorMessage = function (disableErrorMessage = '') {
		if (!disableErrorMessage) {
			return;
		}
		window.smart_manager.notification = { status: 'error', message: disableErrorMessage, hideDelay: window.smart_manager.notificationHideDelayInMs }
		window.smart_manager.showNotification()
	}

	//Function to show Feedback modal.
	SmartManager.prototype.showFeedbackModal = function () {
		window[pluginKey].can_ask_for_feedback = 1
		window[pluginKey].showPannelDialog(this.getDefaultRoute());
	}

	SmartManager.prototype.renderMultilistValuesInGrid = function (values_str, td, addTitleAttr = true, bgColor = '', color = '') {
		// Split the comma-separated values and create elements.
		const options = values_str.split(',').map(cat => cat.trim()).filter(Boolean);
		let badgesDiv = '';
		if(options){
			options.forEach(category => {
				badgesDiv += `<div class="inline-block ${!Array.from(td.classList).some(cls => cls.startsWith('sm_beta_select_')) ? 'text-sm-base-foreground' : ''} px-2 py-0.5 rounded-lg text-xs leading-4  whitespace-nowrap mt-1 mr-1 ${!color ? 'border border-sm-base-border font-normal' : 'font-medium'}" style="background-color: ${bgColor ? bgColor : '#fff'}; ${color ? `color:${color} !important` : ''}">${category}</div>`;
			});
		}
		td.innerHTML = `<div style="overflow:hidden;max-height:${String(window.smart_manager.rowHeight).includes('px') ? window.smart_manager.rowHeight : window.smart_manager.rowHeight+'px'}" ${addTitleAttr ? `title="${td.innerText}"` : ""}>${badgesDiv}</div>`;
		return td;
	}

	// Common pagination handler function.
	SmartManager.prototype.handlePageNavigation = function(targetPage) {
		if ( targetPage >= 1 && targetPage <= window.smart_manager.totalPages && targetPage !== window.smart_manager.currentPageNumber) {
			window.smart_manager.page = targetPage;
			window.smart_manager.currentGetDataParams.async = true;
			window.smart_manager.getData();
		}
	}

	let instance = new SmartManager();
	// Attach to window using dynamic pluginKey
	window[instance.pluginKey] = instance;
	if(typeof window.SmartManager === 'undefined'){
		window.SmartManager = SmartManager;
	}
	if(typeof window.smart_manager === 'undefined'){
		window.smart_manager = instance;
	}
	if(typeof window.SaCommonInstance === 'undefined'){
		window.SaCommonInstance = instance;
	}
})(window);

String.prototype.capitalize = function () {
	return this.charAt(0).toUpperCase() + this.slice(1);
}
//Events to be handled on document ready
jQuery(document).ready(function () {
	jQuery("body").append('<div id="sm_select2_childs_section"></div>');
	if ('#!/pricing' != document.location.hash) {
		window.smart_manager.init();
	}
	jQuery(document)
		.on('click', '.sa-sm-import-wsm-stock-log, .sync_wsm_stock_log_data', function () {
			window.smart_manager.showWSMStockLogImportModal();
		})
		.off('click','.sa_sm_batch_update_background_link').on('click','.sa_sm_batch_update_background_link',function() { //Code for enabline background updating
			window.location.reload();
		})
});

jQuery.widget('ui.dialog', jQuery.extend({}, jQuery.ui.dialog.prototype, {
	_title: function (title) {
		let $title = this.options.title || '&nbsp;'
		if (('titleIsHtml' in this.options) && this.options.titleIsHtml == true)
			title.html($title);
		else title.text($title);
	}
}));

//Code for custom rendrers and extending Handsontable
(function(Handsontable){
	  let defaultTextEditor = Handsontable.editors.TextEditor.prototype.extend();

	//Function to override the SelectEditor function to handle color codes
    Handsontable.editors.SelectEditor.prototype.prepare = function () {

      	// Call the original prepare method
      	Handsontable.editors.BaseEditor.prototype.prepare.apply(this, arguments);

      	let _this2 = this,
      		selectOptions = this.cellProperties.selectOptions,
      		colorCodes = ( typeof(this.cellProperties.colorCodes) != 'undefined' ) ? this.cellProperties.colorCodes : '',
      		options = '';

			if (typeof selectOptions === 'function') {
				options = this.prepareOptions(selectOptions(this.row, this.col, this.prop));
			} else {
		    	options = this.prepareOptions(selectOptions);
		  	}

	      	this.select.innerHTML = '';

	      	Object.entries(options).forEach(([key, value]) => {
				let optionElement = document.createElement('OPTION');
					optionElement.value = key;

				if( colorCodes != ''  ) {
					for( let color in colorCodes ) {
						if( colorCodes[color].indexOf(key) != -1 ) {
							optionElement.className = 'sm_beta_select_'+color;
							break;
						}
					}
				}

				optionElement.innerHTML = value;
				_this2.select.appendChild(optionElement);
			});
	};

	SmartManager.prototype.dateEditor = function(currObj, arguments, format = 'Y-m-d H:i:s', placeholder = 'YYYY-MM-DD HH:MM:SS', cssClass = 'htDateTimeEditor', showDatetimeField = true) {
      // Call the original createElements method
      Handsontable.editors.TextEditor.prototype.createElements.apply(currObj, arguments);

      // Create datepicker input and update relevant properties
      currObj.TEXTAREA = document.createElement('input');
      currObj.TEXTAREA.setAttribute('type', (showDatetimeField === false) ? 'date' : 'datetime-local');
      currObj.TEXTAREA.className = cssClass;
      currObj.textareaStyle = currObj.TEXTAREA.style;
      currObj.textareaStyle.width = 0;
      currObj.textareaStyle.height = 0;

	  currObj.TEXTAREA.setSelectionRange = false;
      // Replace textarea with datepicker
      Handsontable.dom.empty(currObj.TEXTAREA_PARENT);
      currObj.TEXTAREA_PARENT.appendChild(currObj.TEXTAREA);
	  jQuery('.'+cssClass).attr('placeholder',placeholder);
    };

	function customNumericTextEditor(query, callback) {
	    // ...your custom logic of the validator

	    RegExp.escape= function(s) {
		    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
		};

	    let regx = new RegExp("^[0-9]*"+ RegExp.escape(window.smart_manager.wooPriceDecimalSeparator) +"?[0-9]*$");

	    if (regx.test(query)) {
	      callback(true);
	    } else {
	      callback(false);
	    }
	  }

	  function customPhoneTextEditor(value, callback) {
	    // ...your custom logic of the validator
	   	if (/^(\d|\-|\+|\.|\(|\)|\ )*$/.test(value)) {
        	callback(true);
      	} else {
        	callback(false);
      	}
	  }

	  // Register an alias
	  Handsontable.validators.registerValidator('customNumericTextEditor', customNumericTextEditor);
	  Handsontable.validators.registerValidator('customPhoneTextEditor', customPhoneTextEditor);


	  let dateTimeEditor = Handsontable.editors.TextEditor.prototype.extend(),
	  		dateEditor = Handsontable.editors.TextEditor.prototype.extend(),
	  		timeEditor = Handsontable.editors.TextEditor.prototype.extend(),
			customNumericEditor = Handsontable.editors.NumericEditor.prototype.extend();

			customNumericEditor.prototype.createElements = function() {
				// Call the original createElements method
				Handsontable.editors.NumericEditor.prototype.createElements.apply(this, arguments);

				// Create number input and update relevant properties
				this.TEXTAREA = document.createElement('input');
				this.TEXTAREA.setAttribute('type', ((0 === window.smart_manager.useNumberFieldForNumericCols) ? 'text' : 'number'));

				 // Replace textarea with number
				 Handsontable.dom.empty(this.TEXTAREA_PARENT);
				 this.TEXTAREA_PARENT.appendChild(this.TEXTAREA);
			}

			Handsontable.editors.registerEditor('customNumericEditor', customNumericEditor);


        dateTimeEditor.prototype.createElements = function() { window.smart_manager.dateEditor( this, arguments ) };
        dateEditor.prototype.createElements = function() { window.smart_manager.dateEditor( this, arguments, 'Y-m-d', 'YYYY-MM-DD', 'htDateEditor', false ) };
        timeEditor.prototype.createElements = function() { window.smart_manager.dateEditor( this, arguments, 'H:i', 'HH:MM', 'htTimeEditor' ) };

        function numericRenderer(hotInstance, td, row, col, prop, value, cellProperties) {
		    Handsontable.renderers.NumericRenderer.apply(this, arguments);
			let currentRowData = (Object.keys(window.smart_manager.currentDashboardData).length > 0 && window.smart_manager.currentDashboardData.hasOwnProperty(row)) ? window.smart_manager.currentDashboardData[row] : {};
		    let colObj = ( window.smart_manager.currentVisibleColumns.indexOf(col) != -1 ) ? window.smart_manager.currentVisibleColumns[col] : {};

		    if( !value && '' === value && null === value ) {
		    	value = parseFloat(value);
		    	value = ( colObj.hasOwnProperty('decimalPlaces') ) ? value.toFixed( parseInt( colObj.decimalPlaces ) ) : value;
		    }

		    if(!value || value === '' || value == null || value === 0 || value === 0.00 || value === '0' || value === '0.00' ) {
		        td.innerHTML = '<div class="wrapper htRight htNumeric htNoWrap">' + value + '</div>';
		    } else {
		    	td.innerHTML = '<div title="'+ td.innerHTML +'" class="wrapper">' + td.innerHTML + '</div>';
		    }
			// Code for handling colorCodes highlighting for the cells
			let colorCodes = ( typeof(cellProperties.colorCodes) != 'undefined' ) ? cellProperties.colorCodes : '';

			if( value !== '' && value != null ) {

				if( colorCodes != '' ) {
					if ( currentRowData && currentRowData.hasOwnProperty('custom_stock_color_code') ) {
						return td.classList.add(...['sm_beta_select_'+currentRowData['custom_stock_color_code'], 'sm_font_bold']);
					}
					for( let color in colorCodes ) {

						let min = (colorCodes[color].hasOwnProperty('min')) ? colorCodes[color]['min'] : -1,
							max = (colorCodes[color].hasOwnProperty('max')) ? colorCodes[color]['max'] : -1

						if(min < 0 && max < 0){
							continue;
						}

						let v = parseFloat(value);

						if(isNaN(v)){
							continue;
						}
						if( ((min < 0 || max < 0) && ((min >= 0 && v >= min) || (max >= 0 && v <= max)))
							|| ((min >= 0 && max >= 0) && (v >= min) && (v <= max)) ){
							td.classList.add(...['sm_beta_select_'+color, 'sm_font_bold'])
							break;
						}
					}
				}
			}

		    return td;
		}
	  	Handsontable.renderers.registerRenderer('numericRenderer', numericRenderer);

	  	function customTextRenderer(hotInstance, td, row, col, prop, value, cellProperties) {
		    Handsontable.renderers.TextRenderer.apply(this, arguments);
			if (['_sale_price', '_regular_price', '_price'].some(field => prop.includes(field)) && value.length) {
				td.classList.add('sm-price-cell')
				td.innerHTML = '<div title="'+ td.innerHTML +'" class="wrapper sm-price-cell">' + wc.wcSettings.CURRENCY.symbol + td.innerHTML + '</div>';
			} else {
				td.innerHTML = '<div title="'+ td.innerHTML +'" class="wrapper">' + td.innerHTML + '</div>';
			}
		    return td;
		}
	  	Handsontable.renderers.registerRenderer('customTextRenderer', customTextRenderer);

	  	function customHtmlRenderer(hotInstance, td, row, col, prop, value, cellProperties) {
			Handsontable.renderers.HtmlRenderer.apply(this, arguments);
			td.innerHTML = '<div title="'+ td.innerText +'" class="wrapper">' + td.innerHTML + '</div>';

		    return td;
		}
	  	Handsontable.renderers.registerRenderer('customHtmlRenderer', customHtmlRenderer);

	  	function customCheckboxRenderer(hotInstance, td, row, col, prop, value, cellProperties) {

		    Handsontable.renderers.CheckboxRenderer.apply(this, arguments);
		    td.innerHTML = '<div class="wrapper">' + td.innerHTML + '</div>';

		    return td;
		}
	  	Handsontable.renderers.registerRenderer('customCheckboxRenderer', customCheckboxRenderer);

	  	function customPasswordRenderer(hotInstance, td, row, col, prop, value, cellProperties) {

		    Handsontable.renderers.PasswordRenderer.apply(this, arguments);
		    td.innerHTML = '<div class="wrapper">' + td.innerHTML + '</div>';

		    return td;
		}
	  	Handsontable.renderers.registerRenderer('customPasswordRenderer', customPasswordRenderer);

      function datetimeRenderer(hotInstance, td, row, column, prop, value, cellProperties) {
        if( typeof(cellProperties.className) != 'undefined' ) { //code to higlight the cell on selection
            td.setAttribute('class',cellProperties.className);
        }
		if( (value) && (typeof(value) !== 'undefined') && (value.length) ){
			value = value.replace(/T/g, ' ');//replace T with space.
		}

        td.innerHTML = value;

        td.innerHTML = '<div class="wrapper">' + td.innerHTML + '</div>';

        return td;
      }

		function longstringRenderer(hotInstance, td, row, column, prop, value, cellProperties) {
			Handsontable.renderers.HtmlRenderer.apply(this, arguments);
			if( typeof(cellProperties.className) != 'undefined' ) { //code to higlight the cell on selection
				td.setAttribute('class',cellProperties.className);
			}

			td.innerHTML = '<div title="'+ td.innerText +'" class="wrapper">' + td.innerHTML + '</div>';

			return td;
		}

		function selectValueRenderer(hotInstance, td, row, column, prop, value, cellProperties) {
			let source = cellProperties.selectOptions || {},
				className = ( typeof(cellProperties.className) != 'undefined' ) ? cellProperties.className : '',
				colorCodes = ( typeof(cellProperties.colorCodes) != 'undefined' ) ? cellProperties.colorCodes : '';

			// if( className != '' ) { //code to higlight the cell on selection
			// 	td.setAttribute('class',className);
			// }

			if( typeof source != 'undefined' && typeof value != 'undefined' && source.hasOwnProperty(value) ) {
				td.setAttribute('data-value',value);

				if( colorCodes != '' ) {
					for( let color in colorCodes ) {
						if( colorCodes[color].indexOf(value) != -1 ) {
							// className = (( className != '' ) ? className + ' ' : '') + 'sm_beta_select_'+color;
							// td.setAttribute('class',className);
							td.classList.add('sm_beta_select_'+color)
							break;
						}
					}
				}
				td.innerHTML = source[value];
			}
			let bg_color = ('Variable'===source[value]) ? '#ECFEFF' : ('Simple'===source[value]) ? '#EFF6FF' : '';
			let color = ('Variable'===source[value]) ? '#0891B2' : ('Simple'===source[value]) ? '#2563EB' : '';
			return (td.innerText && td.innerText.length) ? window.smart_manager.renderMultilistValuesInGrid(td.innerText, td, true, bg_color, color) : td;
		}

		function multilistRenderer(hotInstance, td, row, column, prop, value, cellProperties) {
			// ...renderer logic
			Handsontable.renderers.TextRenderer.apply(this, arguments);
			if( typeof(cellProperties.className) != 'undefined' ) { //code to higlight the cell on selection
				td.setAttribute('class',cellProperties.className);
			}
			let colType = window.smart_manager?.currentColModel[column]?.type || '';
			if(colType && colType.length && ['dropdown', 'sm.multilist'].includes(colType)){
				return window.smart_manager.renderMultilistValuesInGrid(window.smart_manager?.decodeHTMLString(td.innerHTML, ('terms_product_cat' === prop)), td);
			}
			td.innerHTML = '<div class="wrapper mr-4">' + window.smart_manager?.decodeHTMLString(td.innerHTML, ('terms_product_cat' === prop)) + '</div>';
			return td;
		}

	  Handsontable.renderers.registerRenderer('selectValueRenderer', selectValueRenderer);

	  	function select2Renderer(instance, td, row, col, prop, value, cellProperties) {

		    let selectedId;
		    let optionsList = (cellProperties.select2Options.data) ? cellProperties.select2Options.data : [];
		    let dynamicSelect2 = ( cellProperties.select2Options.hasOwnProperty('loadDataDynamically') ) ? true : false;

		    if( (typeof optionsList === "undefined" || typeof optionsList.length === "undefined" || !optionsList.length) && !dynamicSelect2 ) {
		        Handsontable.cellTypes.text.renderer(instance, td, row, col, prop, value, cellProperties);
		        return td;
		    }

		    if( dynamicSelect2 && typeof(value) == 'object' ) {
				jQuery(td).attr('data-value', JSON.stringify(value));

		    	let values = ( value ) ? value : [];

		    	value = [];
		    	var text = '';
		    	values.forEach(function(obj) {
		    		if( obj.text ) {
						value.push(obj.text.trim());
		    		}
				});

		    } else {
		    	let values = (value + "").split(",");

			    value = [];
			    for (let index = 0; index < optionsList.length; index++) {

			        if (values.indexOf(optionsList[index].id + "") > -1) {
			            selectedId = optionsList[index].id;
			            value.push(optionsList[index].text);
			        }
			    }
		    }

		    value = value.join(", ");

		    Handsontable.cellTypes.text.renderer(instance, td, row, col, prop, value, cellProperties);

			td.innerHTML = '<div class="wrapper">' + td.innerHTML + '</div>';
		    return td;
		}
	  	Handsontable.renderers.registerRenderer('select2Renderer', select2Renderer);
	SmartManager.prototype.addTasksParams = function(params = {}){
		if(!params || !params.hasOwnProperty('cmd') || ("undefined" === typeof(window.smart_manager.isTasksEnabled) && "function" !== typeof(window.smart_manager.isTasksEnabled))) {
			return params;
		}
		let cmdNames = ['get_dashboard_model','get_data_model'];
		if(cmdNames.includes(params['cmd'])){
			return Object.assign(params,{isTasks: (window.smart_manager.isTasksEnabled()) ? 1 : 0});
		}else if('batch_update' !== params['cmd'] && params.hasOwnProperty('edited_data')){
			params.updatedEditedData = ((window.smart_manager.updatedEditedData) && (Object.values(window.smart_manager.updatedEditedData).length > 0)) ? JSON.stringify(window.smart_manager.updatedEditedData) : params['edited_data'];
		}
		return Object.assign(params,{isTasks: (window.smart_manager.isTasksEnabled()) ? 1 : 0,
			title: (window.smart_manager.updatedTitle) ? window.smart_manager.updatedTitle : window.smart_manager.processContent,
			isScheduled: window.smart_manager.isScheduled,
			scheduledFor: (window.smart_manager.isScheduled) ? window.smart_manager.scheduledFor : '0000-00-00 00:00:00',
			scheduledActionAdminUrl: (window.smart_manager.isScheduled) ? window.smart_manager.scheduledActionAdminUrl : ''
		});
	}
	// For getting edited column name
	SmartManager.prototype.getColDisplayName = function(colSrc = ''){
		if(!colSrc || ('undefined' === typeof(window.smart_manager.excludedEditedFieldKeys)) || ('undefined' === typeof(window.smart_manager.currentColModel))){
			return colSrc;
		}
		for(i = 0; i < window.smart_manager.currentColModel.length; i++){
			if(('undefined' !== typeof(window.smart_manager.currentColModel[i])) && window.smart_manager.currentColModel[i] && window.smart_manager.currentColModel[i].hasOwnProperty('src') && window.smart_manager.currentColModel[i].hasOwnProperty('name_display') && (window.smart_manager.currentColModel[i].src === colSrc) && false === window.smart_manager.excludedEditedFieldKeys.includes(colSrc)){
				return window.smart_manager.currentColModel[i].name_display;
			}
		}
	}
	// For changing dashboard display name in bottom bar for tasks
	SmartManager.prototype.changeDashboardDisplayName = function(dashboardDisplayName = ''){
		if(!dashboardDisplayName){
			return;
		}
		window.smart_manager.dashboardDisplayName = ("undefined" !== typeof(window.smart_manager.isTasksEnabled) && "function" === typeof(window.smart_manager.isTasksEnabled) && window.smart_manager.isTasksEnabled()) ? _x('Tasks','bottom bar display name for tasks','smart-manager-for-wp-e-commerce') : dashboardDisplayName;
	}
	// Function to toggle tasks view on/off
	SmartManager.prototype.toggleTasksView = function (show = null) {
		// If show is not specified, toggle the current state
		if (show === null) {
			show = !window.smart_manager.isTasksViewActive;
		}
		
		// Check for unsaved changes
		if ((typeof window.smart_manager.dirtyRowColIds !== 'undefined') && Object.getOwnPropertyNames(window.smart_manager.dirtyRowColIds).length > 0) {
			window.smart_manager.confirmUnsavedChanges({
				'yesCallback': function() {
					window.smart_manager.executeTasksViewToggle(show);
				},
				'noCallback': function() {
					// Do nothing, stay on current view
				}
			});
		} else {
			window.smart_manager.executeTasksViewToggle(show);
		}
	}

	// Execute the actual tasks view toggle
	SmartManager.prototype.executeTasksViewToggle = function (show) {
		window.smart_manager.isTasksViewActive = show;
		
		// Trigger the existing functionality
		if (typeof window.smart_manager.showTasks === 'function') {
			window.smart_manager.showTasks();
		} else {
			// Fallback for lite version
			window.smart_manager.displayTasks({ showHideTasks: show ? 1 : 0 });
		}
	}

	// Code for show/hide tasks
	SmartManager.prototype.displayTasks = function (params = {}){
		switch(true){
			case (params.hasOwnProperty('hideTasks')):
			case params.hasOwnProperty('dashboardChange'):
				window.smart_manager.isTasksViewActive = false;
				window.smart_manager.hideTasksViewBackButton();
				window.smart_manager.updateFloatingActionBarForTasks(false);
				window.smart_manager.updateActionColumnWidth();
				break;
			case params.hasOwnProperty('showHideTasks'):
				if(1 === params.showHideTasks){
					window.smart_manager.showTasksViewBackButton();
					window.smart_manager.updateFloatingActionBarForTasks(true);
					window.smart_manager.updateActionColumnWidth();
					if(!window.location.search.includes('show_edit_history')){
						window.smart_manager.updateState();
					}
				}else{
					window.smart_manager.hideTasksViewBackButton();
					window.smart_manager.updateFloatingActionBarForTasks(false);
					window.smart_manager.updateActionColumnWidth();
					if(!window.location.search.includes('show_edit_history')){
						window.smart_manager.updateState({isTasksEnabled:1});
					}
				}
				break;
		}
	}

	// Update action column width based on current view mode
	SmartManager.prototype.updateActionColumnWidth = function () {
		if (!window.smart_manager.currentVisibleColumns || !window.smart_manager.hot) return;
		// Find and update action column
		const actionColIndex = window.smart_manager.currentVisibleColumns.findIndex(col => col.data === 'sm_action_column');
		if (actionColIndex !== -1) {
			window.smart_manager.currentVisibleColumns[actionColIndex].width = (window.smart_manager.isTasksViewActive === true || window.location.search.includes('show_edit_history')) ? 130 : 80;
			// Update grid settings
			window.smart_manager.hot.updateSettings({
				columns: window.smart_manager.currentVisibleColumns
			});
			window.smart_manager.hot.render();
		}
	}

	// Function to update floating action bar buttons for tasks view
	SmartManager.prototype.updateFloatingActionBarForTasks = function (isTasksView) {
		const floatingBar = jQuery('#sm-floating-action-bar');
		const actionsRow = floatingBar.find('.flex.items-center.gap-4.p-3');
		
		if (isTasksView) {
			// Store original buttons HTML if not already stored
			if (!window.smart_manager.originalFloatingBarButtons) {
				window.smart_manager.originalFloatingBarButtons = actionsRow.html();
			}
			
			// Replace with tasks-specific buttons (Undo and Delete)
			actionsRow.html(`
				<button id="sm-floating-undo-selected-btn" class="inline-flex items-center gap-2 h-9 py-2 pl-2.5 pr-4 rounded-lg border-none font-['Inter',system-ui,sans-serif] text-sm font-medium leading-5 cursor-pointer transition-colors duration-150 whitespace-nowrap shadow-sm bg-[#262626] text-[#fafafa] hover:bg-[#333333] focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50">
					${window.smart_manager.getIcons('undo','#fafafa')}
					<span>${_x('Undo Selected', 'button', 'smart-manager-for-wp-e-commerce')}</span>
				</button>
				<div class="flex-1 min-w-[1.25rem]"></div>
				<button id="sm-floating-delete-selected-tasks-btn" class="inline-flex items-center gap-2 h-9 py-2 pl-2.5 pr-4 rounded-lg border-none font-['Inter',system-ui,sans-serif] text-sm font-medium leading-5 cursor-pointer transition-colors duration-150 whitespace-nowrap shadow-sm bg-transparent text-[#f87171] hover:bg-[#f87171]/10 focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50">
					<svg class="shrink-0 w-4 h-4" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M2 4H14" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M12.6667 4V13.3333C12.6667 14 12 14.6667 11.3333 14.6667H4.66667C4 14.6667 3.33334 14 3.33334 13.3333V4" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M5.33334 4.00001V2.66668C5.33334 2.00001 6 1.33334 6.66667 1.33334H9.33334C10 1.33334 10.6667 2.00001 10.6667 2.66668V4.00001" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M6.66666 7.33334V11.3333" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M9.33334 7.33334V11.3333" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					<span>${_x('Delete Selected', 'button', 'smart-manager-for-wp-e-commerce')}</span>
				</button>
			`);
			
			// Bind click handlers for tasks buttons
			window.smart_manager.bindTasksFloatingBarEvents();
		} else {
			// Restore original buttons
			if (window.smart_manager.originalFloatingBarButtons) {
				actionsRow.html(window.smart_manager.originalFloatingBarButtons);
			}
		}
	}

	// Function to show History dashboard header (replaces normal header content)
	SmartManager.prototype.showTasksViewBackButton = function () {
		const header = jQuery('#sm-header');
		
		// Store original header content if not already stored
		if (!window.smart_manager.originalHeaderContent) {
			window.smart_manager.originalHeaderContent = header.html();
		}
		
		// Replace header content with History view layout
		header.html(`
			<!-- History Header - Left Section -->
			<div class="flex items-center gap-3 shrink-0">
				<button id="sm_tasks_back_btn" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sm-base-border bg-sm-base-background text-sm font-medium text-sm-base-foreground cursor-pointer hover:bg-sm-base-muted transition-colors" title="${_x('Back to Dashboard', 'tooltip', 'smart-manager-for-wp-e-commerce')}">
					<svg width="15" height="7" viewBox="0 0 15 7" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M3.33073 0.665039L0.664062 3.33171M0.664062 3.33171L3.33073 5.99837M0.664062 3.33171H13.9974" stroke="#0A0A0A" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					<span>${_x('Back to Dashboard', 'button', 'smart-manager-for-wp-e-commerce')}</span>
				</button>
			</div>
			
			<!-- History Header - Center/Title Section -->
			<div class="flex items-center flex-1">
				<h1 id="sm-header-title" class="p-0 text-base leading-5 font-semibold text-sm-base-foreground whitespace-nowrap">${_x('History', 'dashboard title', 'smart-manager-for-wp-e-commerce')}</h1>
			</div>
			
			<!-- History Header - Right Section Actions -->
			<div class="flex items-center gap-2 shrink-0">
				<button id="sm-clear-history-btn" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 cursor-pointer hover:bg-red-50 transition-colors">
					${window.smart_manager.getIcons('delete','#DC2626')}
					<span>${_x('Clear History', 'button', 'smart-manager-for-wp-e-commerce')}</span>
				</button>
				<button id="sm-undo-all-btn" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-sm-base-border bg-sm-base-background text-sm font-medium text-sm-base-foreground cursor-pointer hover:bg-sm-base-muted transition-colors shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
					${window.smart_manager.getIcons('undo','#0A0A0A')}
					<span>${_x('Undo all', 'button', 'smart-manager-for-wp-e-commerce')}</span>
				</button>
			</div>
		`);
		
		// Bind History header button events
		window.smart_manager.bindHistoryHeaderEvents();
	}
	
	// Bind events for History header buttons
	SmartManager.prototype.bindHistoryHeaderEvents = function () {
		// Back button click - return to normal dashboard
		jQuery(document).off('click', '#sm_tasks_back_btn').on('click', '#sm_tasks_back_btn', function(e) {
			e.preventDefault();
			window.smart_manager.toggleTasksView(false);
		});
		
		// Clear History button click
		jQuery(document).off('click', '#sm-clear-history-btn').on('click', '#sm-clear-history-btn', function(e) {
			e.preventDefault();
			if (typeof window.smart_manager.displayUndoTaskModal === 'function') {
				window.smart_manager.displayUndoTaskModal('sm_beta_delete_all_tasks', _x('All History', 'delete all history', 'smart-manager-for-wp-e-commerce'));
			}
		});
		
		// Undo All button click
		jQuery(document).off('click', '#sm-undo-all-btn').on('click', '#sm-undo-all-btn', function(e) {
			e.preventDefault();
			if (typeof window.smart_manager.displayUndoTaskModal === 'function') {
				window.smart_manager.displayUndoTaskModal('sm_beta_undo_all_tasks', _x('All Tasks', 'undo all tasks', 'smart-manager-for-wp-e-commerce'));
			}
		});
	}

	// Function to hide History header and restore normal header
	SmartManager.prototype.hideTasksViewBackButton = function () {
		const header = jQuery('#sm-header');
		
		// Restore original header content if available
		if (window.smart_manager.originalHeaderContent) {
			header.html(window.smart_manager.originalHeaderContent);
			window.smart_manager.originalHeaderContent = null;
			
			// Re-initialize header controls after restoring
			if (typeof window.smart_manager.initHeaderControls === 'function') {
				window.smart_manager.initHeaderControls();
			}
		}
	}

	//Function to add title for each of the column headers
	SmartManager.prototype.refreshColumnsTitleAttribute = function(){
		setTimeout(() => {
			window.smart_manager.hot.updateSettings({
				data: window.smart_manager.currentDashboardData,
				columns: window.smart_manager.currentVisibleColumns,
				colHeaders: window.smart_manager.column_names
			});
			jQuery('table.htCore').find('.colHeader').each(function() {
				jQuery(this).attr('title',jQuery(this).text()+' '+_x('(Click to sort)', 'tooltip', 'smart-manager-for-wp-e-commerce'));
			});
		}, 1000);
	}

	// Common function to set save button state (enabled/disabled)
	SmartManager.prototype.setSaveButtonState = function (enabled = false) {
		// Toggle unsaved changes UI (Add New vs Discard Changes button)
		if (typeof window.smart_manager.toggleUnsavedChangesUI === 'function') {
			window.smart_manager.toggleUnsavedChangesUI(enabled);
		}
	}


	SmartManager.prototype.reset = function (fullReset = false) {
		SaCommonManager.prototype.reset.call(this, fullReset);
		if (fullReset) {
			this.currentDashboardModel = '';
			this.currentVisibleColumns = [];
			this.simpleSearchText = '';
			if (this.loadingDashboardForsavedSearch === false) {
				this.advancedSearchQuery = new Array();
				this.advancedSearchRuleCount = 0;
			}
			this.colModelSearch = {}
		}
		this.selectedRows = [];
		this.addRecords_count = 0;
		this.page = 1;
		this.dirtyRowColIds = {};
		this.editedData = {};
		// Hide floating action bar on reset
		if (typeof (this.hideFloatingActionBar) !== "undefined" && typeof (this.hideFloatingActionBar) === "function") {
			this.hideFloatingActionBar();
		}
		this.updatedEditedData = {};
		this.processContent = '';
		this.updatedTitle = '';
		this.editedColumnTitles = {};
		this.exportCSVActions = ['sm_export_selected_records', 'sm_export_entire_store'];
		this.recordSelectNotification = (this.sm_beta_pro == 1) ? true : false;
		if (this.hot) {
			if (this.hot.selection) {
				if (this.hot.selection.highlight) {
					if (this.hot.selection.highlight.selectAll) {
						delete this.hot.selection.highlight.selectAll
					}
					this.hot.selection.highlight.selectedRows = []
				}
			}
		}
	}

	SmartManager.prototype.refresh = function (dataParams) {
		SaCommonManager.prototype.refresh.call(this, dataParams);
		this.reset();
		if (this.sm_beta_pro == 0) {
			if (typeof (this.disableSelectedRows) !== "undefined" && typeof (this.disableSelectedRows) === "function") {
				this.disableSelectedRows(false);
			}
		}
        this.getData(dataParams);
	}

	SmartManager.prototype.showLoader = function (is_show = true) {
		SaCommonManager.prototype.showLoader.call(this, is_show);
	}

	SmartManager.prototype.showNotification = function () {
		if((!window.location.href.includes(this.advancedSearchRoute) && !window.location.href.includes(this.bulkEditRoute)) && this.notification.hasOwnProperty('message') && '' !== this.notification.message && (typeof (this.showPannelDialog) !== "undefined" && typeof (this.showPannelDialog) === "function" && typeof (this.getDefaultRoute) !== "undefined" && typeof (this.getDefaultRoute) === "function")){
			if (window.location.href.includes(this.columnManagerRoute)) { // Added as Col manager HTML & click events are not coming from raw js -- flickers for chrome. Can fix later
				setTimeout(() => { this.showPannelDialog(this.columnManagerRoute) }, 1)
			}
			this.showPannelDialog(this.getDefaultRoute())
		}
	}

	SmartManager.prototype.showModal = function () {
		SaCommonManager.prototype.showModal.call(this);
	}

	SmartManager.prototype.hideModal = function () {
		SaCommonManager.prototype.hideModal.call(this);
	}

	SmartManager.prototype.showPannelDialog = function (route = '', currentRoute = '') {
		SaCommonManager.prototype.showPannelDialog.call(this, route, currentRoute);
	}

	SmartManager.prototype.getDefaultRoute = function (isReplaceRoute = false) {
		return SaCommonManager.prototype.getDefaultRoute.call(this, isReplaceRoute);
	}

	SmartManager.prototype.getCheckboxValues = function (colObj) {
		return SaCommonManager.prototype.getCheckboxValues.call(this, colObj);
	}

	// Code for resetting search functionalities.
	SmartManager.prototype.resetSearch = function(){
		('advanced' === window.smart_manager.searchType) ? jQuery('#search_switch').prop('checked', false).trigger('change') : jQuery('#sm_simple_search_box').val('');
	}

	// Function to detect if filtered data or not
	SmartManager.prototype.isFilteredData = function(){
		return (('simple' === window.smart_manager.searchType && window.smart_manager.simpleSearchText !== '') || ('simple' !== window.smart_manager.searchType && window.smart_manager.advancedSearchQuery.length > 0))
	}
	
	// Function to toggle header in case of product stock log dashboard.
	SmartManager.prototype.toggleHeader = function(){
		('product_stock_log' === window.smart_manager.dashboardKey) ? jQuery('#sm-header').addClass('hidden') : jQuery('#sm-header').removeClass('hidden');
		if('product'===window.smart_manager.dashboardKey){
			jQuery('#sm_navbar_import_btn').removeClass('hidden');
		} else{
			jQuery('#sm_navbar_import_btn').addClass('hidden');
		}
	}

	// Function to get custom views for current dashboard
	SmartManager.prototype.getCustomViewsForDashboard = function() {
		const currentKey = window.smart_manager.dashboardKey;
		const views = [];
		const smViews = window.smart_manager.sm_views || {};
		const viewPostTypes = window.smart_manager.viewPostTypes || {};
		const ownedViews = window.smart_manager.ownedViews || [];
		if (parseInt(window.smart_manager.sm_beta_pro) !== 1) return views;
		if (!smViews || typeof smViews !== 'object') return views;
		Object.keys(smViews).forEach(viewSlug => {
			const viewPostType = viewPostTypes[viewSlug];
			if (viewPostType === currentKey) {
				views.push({
					slug: viewSlug,
					name: smViews[viewSlug],
					isOwned: ownedViews.includes(viewSlug)
				});
			}
		});
		return views;
	}

	// Function to get current custom view name
	SmartManager.prototype.getCurrentCustomViewName = function() {
		if(window.smart_manager.isCustomView && window.smart_manager.hasOwnProperty('sm_views') && 'object' === typeof(window.smart_manager.sm_views)){
			let ViewName = window.smart_manager.sm_views[window.smart_manager.getViewSlug(window.smart_manager.dashboardName)]
			return (ViewName && typeof(ViewName)!=='undefined') ? ViewName :  _x('None', 'custom view', 'smart-manager-for-wp-e-commerce');
		}
		return _x('None', 'custom view', 'smart-manager-for-wp-e-commerce');
	}

	// Function to build custom views list HTML
	SmartManager.prototype.buildCustomViewsListHtml = function() {
		const views = window.smart_manager.getCustomViewsForDashboard();
		if (views.length === 0) {
			return `<li class="px-2 py-1.5 text-sm text-sm-base-muted-foreground">${_x('No custom views', 'custom views', 'smart-manager-for-wp-e-commerce')}</li>`;
		}
		return views.map(view => `
			<li class="cursor-pointer">
				<button class="sm-custom-view-item w-full text-left px-2 py-1.5 cursor-pointer rounded-md text-sm leading-5 font-normal text-sm-base-foreground hover:bg-sm-base-muted transition-colors overflow-hidden text-ellipsis" data-view-slug="${view.slug}">${view.name}</button>
			</li>
		`).join('');
	}

	// Build the header HTML component
	SmartManager.prototype.buildHeaderHtml = function() {
		const dashboardTitle = window.smart_manager.dashboardDisplayName || _x('Products', 'dashboard name', 'smart-manager-for-wp-e-commerce');
		/* translators: %s is the dashboard name (e.g., Product, Order, etc.) */
		const addBtnText = sprintf(_x('New %s', 'button', 'smart-manager-for-wp-e-commerce'), dashboardTitle.replace(/s$/, ''));
		return `
		<header id="sm-header" class="flex items-center justify-between w-full px-3 md:px-6 py-3 bg-[#FBFBFB] border-b border-sm-base-border gap-2 md:gap-4 mt-2">
			<!-- Left Section - Title -->
			<div class="flex items-center gap-1 shrink-0">
				<h1 id="sm-header-title" class="p-0 text-base leading-5 font-semibold text-sm-base-foreground whitespace-nowrap">${dashboardTitle}</h1>
			</div>

			<!-- Center Section - Controls -->
			<div class="flex items-center gap-2 md:gap-4 flex-1 min-w-0 relative">
				<!-- Custom view dropdown trigger (shown when NOT on custom view) -->
				<button id="sm-custom-view-btn" aria-haspopup="true" aria-expanded="false" class="${window.smart_manager.isCustomView ? '!hidden' : 'inline-flex'} cursor-pointer gap-1.5 rounded-md border border-sm-base-border bg-sm-base-background px-2 md:px-3 hover:bg-[#FBFBFB] py-1.5 text-[0.8125rem] leading-4 text-sm-base-foreground group items-center shrink-0">
					<span class="text-sm-base-foreground hidden sm:inline">${_x('Custom view:', 'label', 'smart-manager-for-wp-e-commerce')}</span>
					<span id="sm-custom-view-selected" class="font-medium text-sm-base-foreground">${window.smart_manager.getCurrentCustomViewName()}</span>
					<svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="text-sm-base-muted-foreground shrink-0">
						<path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>

				<!-- Custom view active display (shown when ON custom view) -->
				<div id="sm-custom-view-active" class="${window.smart_manager.isCustomView ? 'flex' : '!hidden'} items-center gap-1 shrink-0">
					<button id="sm-custom-view-active-btn" class="cursor-pointer gap-2 rounded-lg border border-sm-colors-violet-200 bg-sm-base-background px-4 py-1.5 text-sm leading-5 text-sm-base-primary shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] inline-flex items-center shrink-0">
						<span class="text-sm-base-foreground hidden sm:inline">${_x('Custom view:', 'label', 'smart-manager-for-wp-e-commerce')}</span>
						<span id="sm-custom-view-active-name" class="font-medium text-sm-base-primary">${window.smart_manager.getCurrentCustomViewName()}</span>
					</button>
					<button title="Edit View" id="sm-edit-custom-view-btn" class="cursor-pointer gap-1.5 rounded-lg px-3 py-2 text-xs leading-4 font-medium text-sm-base-foreground inline-flex items-center shrink-0 hover:bg-sm-base-muted transition-colors shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
						<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M6.66406 1.32926H1.9974C1.64377 1.32926 1.30464 1.46974 1.05459 1.71979C0.804538 1.96984 0.664063 2.30898 0.664062 2.6626V11.9959C0.664063 12.3496 0.804538 12.6887 1.05459 12.9387C1.30464 13.1888 1.64377 13.3293 1.9974 13.3293H11.3307C11.6844 13.3293 12.0235 13.1888 12.2735 12.9387C12.5236 12.6887 12.6641 12.3496 12.6641 11.9959V7.32926M10.9141 1.07925C11.1793 0.814036 11.5391 0.665039 11.9141 0.665039C12.2892 0.665039 12.6489 0.814036 12.9141 1.07925C13.1793 1.34447 13.3283 1.70418 13.3283 2.07925C13.3283 2.45433 13.1793 2.81404 12.9141 3.07925L6.90546 9.08859C6.74716 9.24675 6.5516 9.36253 6.33679 9.42525L4.42146 9.98525C4.36409 10.002 4.30328 10.003 4.2454 9.98816C4.18751 9.97333 4.13468 9.94321 4.09242 9.90096C4.05017 9.8587 4.02005 9.80587 4.00522 9.74798C3.99039 9.69009 3.99139 9.62929 4.00813 9.57192L4.56812 7.65659C4.63114 7.44195 4.74715 7.24662 4.90546 7.08859L10.9141 1.07925Z" stroke="#0A0A0A" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</button>
					<button title="Delete View" id="sm-delete-custom-view-btn" class="cursor-pointer gap-1.5 rounded-lg px-1 py-2 text-xs leading-4 font-medium text-sm-base-foreground inline-flex items-center shrink-0 hover:bg-sm-base-muted transition-colors shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
						${window.smart_manager.getIcons('delete','#DC2626')}
					</button>
				</div>

				<!-- Show variations toggle placeholder (populated by dashboard-specific JS) -->
				<div id="sm-header-center-extras"></div>

				<!-- Panel: Custom Views (only used when NOT on custom view) -->
				<div id="sm-custom-views-panel" class="sm-custom-scrollbar absolute left-0 top-8 z-999 w-56 rounded-lg border border-sm-base-border bg-sm-base-background shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] overflow-hidden hidden">
					<!-- Header -->
					<div class="bg-sm-base-background sticky top-0 z-10 pt-1 px-1">
						<div class="flex items-center justify-between px-2 py-1.5">
							<span class="text-xs leading-4 font-normal text-sm-base-muted-foreground">${_x('Custom view', 'label', 'smart-manager-for-wp-e-commerce')}</span>
							<button id="sm-reset-custom-view" class="hidden text-xs leading-4 font-medium text-sm-base-primary px-1 rounded-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] hover:opacity-80 transition-opacity">${_x('Reset', 'button', 'smart-manager-for-wp-e-commerce')}</button>
						</div>
					</div>
					
					<!-- List -->
					<div class="px-1 overflow-hidden max-h-48 overflow-y-auto">
						<ul id="sm-custom-view-list" class="flex flex-col">
							${window.smart_manager.buildCustomViewsListHtml()}
						</ul>
					</div>
					
					<!-- Actions Footer -->
					<div class="bg-sm-base-background border-t border-sm-base-border p-2">
						<button id="sm-create-custom-view" class="cursor-pointer w-full h-8 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-sm-base-input bg-sm-base-background shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] text-xs leading-4 font-medium text-sm-base-primary hover:bg-sm-base-muted transition-colors">
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="shrink-0">
								<path d="M8 3.33334V12.6667M3.33334 8H12.6667" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
							<span>${_x('Create Custom View', 'button', 'smart-manager-for-wp-e-commerce')}</span>
						</button>
					</div>
				</div>
			</div>

			<!-- Right Section - Actions -->
			<div class="flex items-center gap-1 md:gap-2 shrink-0">
				<!-- Add New Button (hidden when there are unsaved changes) -->
				<button id="sm-add-new-btn" class="cursor-pointer rounded-md bg-sm-colors-violet-50 px-2 md:px-3.5 py-2 text-[0.8125rem] leading-4 font-medium text-sm-base-primary inline-flex items-center shrink-0 hover:bg-[#e5e0ff] transition-colors">
					<svg class="mr-2" width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.665039 5.33164H9.99837M5.33171 0.664978V9.99831" stroke="#6B63F1" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/></svg>
					<span class="hidden sm:inline">${addBtnText}</span>
				</button>

				<!-- Discard Changes Button (shown when there are unsaved changes) -->
				<button id="sm-discard-btn" class="!hidden cursor-pointer gap-1.5 rounded-md px-2 md:px-3.5 py-2 text-[0.8125rem] leading-4 font-medium text-sm-base-destructive items-center shrink-0 hover:bg-red-50 transition-colors">
					<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" class="shrink-0">
						<path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					<span class="hidden sm:inline">${_x('Discard Changes', 'button', 'smart-manager-for-wp-e-commerce')}</span>
				</button>

				<!-- Save Button (changes appearance when there are unsaved changes) -->
				<button id="sm-save-btn" class="cursor-pointer gap-1.5 rounded-md px-2 md:px-3.5 py-2 text-[0.8125rem] leading-4 font-medium text-sm-base-muted-foreground inline-flex items-center shrink-0 hover:bg-sm-base-muted transition-colors">
					<svg id="sm-save-btn-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" class="shrink-0">
						<path d="M9.99837 12.665V7.99831C9.99837 7.8215 9.92814 7.65193 9.80311 7.52691C9.67809 7.40188 9.50852 7.33164 9.33171 7.33164H3.99837C3.82156 7.33164 3.65199 7.40188 3.52697 7.52691C3.40194 7.65193 3.33171 7.8215 3.33171 7.99831V12.665M3.33171 0.664978V3.33164C3.33171 3.50846 3.40194 3.67802 3.52697 3.80305C3.65199 3.92807 3.82156 3.99831 3.99837 3.99831H8.66504M8.79837 0.664978C9.15006 0.669987 9.48553 0.813759 9.73171 1.06498L12.265 3.59831C12.5163 3.84449 12.66 4.17995 12.665 4.53164V11.3316C12.665 11.6853 12.5246 12.0244 12.2745 12.2745C12.0245 12.5245 11.6853 12.665 11.3317 12.665H1.99837C1.64475 12.665 1.30561 12.5245 1.05556 12.2745C0.805515 12.0244 0.665039 11.6853 0.665039 11.3316V1.99831C0.665039 1.64469 0.805515 1.30555 1.05556 1.0555C1.30561 0.805454 1.64475 0.664978 1.99837 0.664978H8.79837Z" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					<span class="hidden sm:inline">${_x('Save', 'button', 'smart-manager-for-wp-e-commerce')}</span>
				</button>
			</div>
		</header>`;
	}

	// Initialize header controls and event listeners
	SmartManager.prototype.initHeaderControls = function() {
		// Update custom views list
		if (window.smart_manager.sm_beta_pro == 1) {
			jQuery('#sm-custom-view-list').html(window.smart_manager.buildCustomViewsListHtml());
		}
		
		// Initialize discard button click handler
		jQuery(document).off('click', '#sm-discard-btn').on('click', '#sm-discard-btn', function(e) {
			e.preventDefault();
			if (typeof window.smart_manager.showConfirmDialog === 'function') {
				window.smart_manager.showConfirmDialog({
					title: _x('Discard Changes?', 'modal title', 'smart-manager-for-wp-e-commerce'),
					content: '<span class="text-sm-base-muted-foreground">' + _x("The changes you've made cannot be reverted. Do you want to discard all changes?", 'modal content', 'smart-manager-for-wp-e-commerce') + '</span>',
					showCloseIcon: true,
					showCloseCTAFirst: false,
					btnParams: {
						yesText: _x('Yes, Discard', 'button', 'smart-manager-for-wp-e-commerce'),
						yesBtnClass: 'bg-transparent text-sm-base-destructive hover:bg-red-50',
						yesCallback: function() {
							if (typeof window.smart_manager.discardChanges === 'function') {
								window.smart_manager.discardChanges();
							}
						},
						noText: _x('No', 'button', 'smart-manager-for-wp-e-commerce'),
						noBtnClass: 'bg-sm-base-primary text-sm-base-primary-foreground hover:bg-[#5850d6]'
					}
				});
			}
		});

		// Initialize edit view button click handler
		jQuery(document).off('click', '#sm-edit-custom-view-btn').on('click', '#sm-edit-custom-view-btn', function(e) {
			e.preventDefault();
			if (typeof window.smart_manager.createUpdateViewDialog === 'function') {
				window.smart_manager.createUpdateViewDialog('update', { dashboardChecked: true, advancedSearchChecked: (jQuery('#search_switch').is(':checked')) ? true : false });
			}
		});

		// Initialize delete view button click handler
		jQuery(document).off('click', '#sm-delete-custom-view-btn').on('click', '#sm-delete-custom-view-btn', function(e) {
			e.preventDefault();
			let viewName = window.smart_manager.dashboardName || '';
			let confirmParams = {
				title: `<span class="sm-error-icon"><span class="dashicons dashicons-warning" style="vertical-align: text-bottom;"></span>&nbsp;${_x('Attention', 'modal title', 'smart-manager-for-wp-e-commerce')}!</span>`,
				/* translators: %s is the custom view name */
				content: sprintf(_x('Are you sure you want to delete the custom view "%s"? This action cannot be undone.', 'modal content', 'smart-manager-for-wp-e-commerce'), viewName),
				btnParams: {
					yesText: _x('Delete', 'button', 'smart-manager-for-wp-e-commerce'),
					yesCallback: function() {
						if (typeof window.smart_manager.deleteView === 'function') {
							window.smart_manager.deleteView({
								type: 'custom_views',
								/* translators: %s is the custom view name */
								success_msg: sprintf(_x('Custom view "%s" deleted successfully!', 'notification', 'smart-manager-for-wp-e-commerce'), viewName)
							});
						}
					},
					noText: _x('Cancel', 'button', 'smart-manager-for-wp-e-commerce')
				}
			};
			if (typeof window.smart_manager.showConfirmDialog === 'function') {
				window.smart_manager.showConfirmDialog(confirmParams);
			}
		});
	}

	// Toggle custom view UI state (dropdown vs active display)
	SmartManager.prototype.toggleCustomViewUI = function() {
		const isCustomView = window.smart_manager.isCustomView;
		const dropdownBtn = jQuery('#sm-custom-view-btn');
		const activeDisplay = jQuery('#sm-custom-view-active');
		
		if (isCustomView) {
			// Show active display, hide dropdown
			dropdownBtn.removeClass('inline-flex').addClass('!hidden');
			activeDisplay.removeClass('!hidden').addClass('flex');
			// Update the active view name
			jQuery('#sm-custom-view-active-name').text(window.smart_manager.getCurrentCustomViewName());
			jQuery('#sm-custom-views-panel').toggleClass('hidden');
		} else {
			// Show dropdown, hide active display
			dropdownBtn.removeClass('!hidden').addClass('inline-flex');
			activeDisplay.removeClass('flex').addClass('!hidden');
			// Update the dropdown selected text
			jQuery('#sm-custom-view-selected').text(window.smart_manager.getCurrentCustomViewName());
		}
	}

	// Toggle unsaved changes UI state
	SmartManager.prototype.toggleUnsavedChangesUI = function(hasChanges) {
		const addBtn = jQuery('#sm-add-new-btn');
		const discardBtn = jQuery('#sm-discard-btn');
		const saveBtn = jQuery('#sm-save-btn');
		
		if (hasChanges) {
			// Hide add new, show discard
			addBtn.removeClass('inline-flex').addClass('!hidden');
			discardBtn.removeClass('!hidden').addClass('inline-flex');
			// Update save button to primary style
			saveBtn.removeClass('text-sm-base-muted-foreground hover:bg-sm-base-muted')
				.addClass('bg-sm-base-primary text-white hover:bg-sm-base-primary/90');
		} else {
			// Show add new, hide discard
			addBtn.removeClass('!hidden').addClass('inline-flex');
			discardBtn.removeClass('inline-flex').addClass('!hidden');
			// Reset save button to default style
			saveBtn.addClass('text-sm-base-muted-foreground hover:bg-sm-base-muted')
				.removeClass('bg-sm-base-primary text-white hover:bg-sm-base-primary/90');
		}
	}

	// Discard changes and refresh grid
	SmartManager.prototype.discardChanges = function() {
		// Reset dirty state
		window.smart_manager.dirtyRowColIds = {};
		// Remove dirty cell styling
		jQuery('#sm_editor_grid .sm-grid-dirty-cell').removeClass('sm-grid-dirty-cell');
		// Refresh the grid data
		if (typeof window.smart_manager.refresh === 'function') {
			window.smart_manager.refresh();
		}
		// Update UI
		window.smart_manager.toggleUnsavedChangesUI(false);
	}

	// Update header when dashboard changes
	SmartManager.prototype.updateHeader = function() {
		jQuery('#sm-header-title').text(window.smart_manager.dashboardDisplayName ||'');
		jQuery('#sm-add-new-btn span').text(sprintf(_x('New %s', 'button', 'smart-manager-for-wp-e-commerce'), window.smart_manager.dashboardDisplayName.replace(/s$/, '')));
		jQuery('#sm-custom-view-selected').text(window.smart_manager.getCurrentCustomViewName());
		// Update custom views list for current dashboard
		if (window.smart_manager.sm_beta_pro == 1) {
			jQuery('#sm-custom-view-list').html(window.smart_manager.buildCustomViewsListHtml());
		}
		(['shop_order', 'shop_subscription'].includes(window.smart_manager.dashboardKey) || ['shop_order', 'shop_subscription'].includes(window.smart_manager.viewPostTypes[window.smart_manager.dashboardKey])) ? jQuery('#sm-print-invoice-btn').removeClass('!hidden').addClass('inline-flex') : jQuery('#sm-print-invoice-btn').addClass('!hidden').removeClass('inline-flex')
	}

	// Build pagination HTML component
	SmartManager.prototype.buildPaginationHtml = function() {
		const currentPage = window.smart_manager.currentPageNumber;
		const totalPages = window.smart_manager.totalPages;
		
		// Generate page numbers to display
		let pageNumbers = [];
		const maxVisiblePages = 3;
		
		if (totalPages <= maxVisiblePages) {
			// Show all pages
			for (let i = 1; i <= totalPages; i++) {
				pageNumbers.push(i);
			}
		} else {
			// Show current page with context
			let startPage = Math.max(1, currentPage - 1);
			let endPage = Math.min(totalPages, currentPage + 1);
			
			// Adjust if we're near the beginning or end
			if (currentPage <= 2) {
				endPage = Math.min(maxVisiblePages, totalPages);
			} else if (currentPage >= totalPages - 1) {
				startPage = Math.max(1, totalPages - maxVisiblePages + 1);
			}
			
			for (let i = startPage; i <= endPage; i++) {
				pageNumbers.push(i);
			}
		}
		
		let pageButtonsHtml = '';
		pageNumbers.forEach((pageNum) => {
			const isActive = pageNum === currentPage;
			pageButtonsHtml += `
				<button class="sm-pagination-page cursor-pointer ${isActive ? 'bg-white border border-sm-base-input text-sm-base-foreground' : 'text-sm-base-foreground hover:bg-sm-base-muted'} flex items-center justify-center w-9 h-9 rounded-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] font-medium text-sm leading-5 transition-colors" data-page="${pageNum}">
					${pageNum}
				</button>`;
		});
		
		// Add ellipsis if needed
		if (pageNumbers[pageNumbers.length - 1] < totalPages) {
			pageButtonsHtml += `
				<div class="flex items-center justify-center w-9 h-9 rounded-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-sm-base-foreground">
						<circle cx="3" cy="8" r="1" fill="currentColor"/>
						<circle cx="8" cy="8" r="1" fill="currentColor"/>
						<circle cx="13" cy="8" r="1" fill="currentColor"/>
					</svg>
				</div>`;
		}
		
		const prevDisabled = currentPage <= 1;
		const nextDisabled = currentPage >= totalPages;
		
		return `
			<div id="sm_pagination_controls" class="flex items-center gap-1 justify-end ">
				<button id="sm_pagination_prev" ${prevDisabled ? 'disabled' : ''} 
					class="flex items-center gap-2 h-9 pl-2.5 pr-4 py-2 rounded-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] font-medium text-sm leading-5 ${prevDisabled ? 'cursor-not-allowed text-sm-base-muted-foreground opacity-50' : 'cursor-pointer text-sm-base-foreground hover:bg-sm-base-muted'} transition-colors">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					<span>${_x('Previous', 'pagination button', 'smart-manager-for-wp-e-commerce')}</span>
				</button>
				<div class="flex items-center gap-1">
					${pageButtonsHtml}
				</div>
				<button id="sm_pagination_next" ${nextDisabled ? 'disabled' : ''} 
					class="flex items-center gap-2 h-9 pl-4 pr-2.5 py-2 rounded-lg shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] font-medium text-sm leading-5 ${nextDisabled ? 'cursor-not-allowed text-sm-base-muted-foreground opacity-50' : 'cursor-pointer bg-sm-base-muted text-sm-base-foreground hover:bg-sm-base-muted/80'} transition-colors">
					<span>${_x('Next', 'pagination button', 'smart-manager-for-wp-e-commerce')}</span>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</button>
			</div>`;
	}

	// Build the floating action bar HTML component
	SmartManager.prototype.buildFloatingActionBarHtml = function() {
		return `
		<div id="sm-floating-action-bar" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] p-0 transition-all duration-200 ease-out opacity-0 invisible translate-y-5 pointer-events-none">
			<div class="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-[25rem] max-w-[90vw] w-[55rem]">
				<!-- Top Row - Close button and selected count -->
				<div class="flex items-center gap-2.5 px-3 py-2 border-b border-white/10">
					<button id="sm-floating-bar-close" class="flex items-center justify-center w-8 h-8 p-2 bg-transparent border-none rounded-lg cursor-pointer text-[#fafafa] transition-colors duration-150 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50" title="${_x('Clear selection', 'tooltip', 'smart-manager-for-wp-e-commerce')}">
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</button>
					<div class="flex items-center gap-1 flex-1 font-['Inter',system-ui,sans-serif] text-sm font-normal leading-5 text-[#fafafa]">
						<span id="sm-floating-bar-count" class="font-medium">0</span>
						<span id="sm-floating-bar-dashboard-name">${window.smart_manager.dashboardDisplayName || ''}</span>
						<span>${_x('selected', 'selection status', 'smart-manager-for-wp-e-commerce')}</span>
					</div>
				</div>
				<!-- Actions Row -->
				<div class="flex items-center gap-4 p-3 flex-wrap">
					<button id="sm-floating-bulk-edit-btn" class="inline-flex items-center gap-2 h-9 py-2 pl-2.5 pr-4 rounded-lg border-none font-['Inter',system-ui,sans-serif] text-sm font-medium leading-5 cursor-pointer transition-colors duration-150 whitespace-nowrap shadow-sm bg-[#262626] text-[#fafafa] hover:bg-[#333333] focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50">
						<svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M9.9974 2.66504L8.38806 1.05571C8.13807 0.80564 7.79899 0.665115 7.4454 0.665039H1.9974C1.64377 0.665039 1.30464 0.805515 1.05459 1.05556C0.804538 1.30561 0.664063 1.64475 0.664062 1.99837V12.665C0.664063 13.0187 0.804538 13.3578 1.05459 13.6078C1.30464 13.8579 1.64377 13.9984 1.9974 13.9984H9.9974C10.351 13.9984 10.6902 13.8579 10.9402 13.6078C11.1903 13.3578 11.3307 13.0187 11.3307 12.665M3.33073 11.3317H3.9974M12.2494 7.74898C12.5149 7.48341 12.6641 7.12321 12.6641 6.74764C12.6641 6.37207 12.5149 6.01188 12.2494 5.74631C11.9838 5.48074 11.6236 5.33154 11.248 5.33154C10.8725 5.33154 10.5123 5.48074 10.2467 5.74631L7.57338 8.42097C7.41488 8.57939 7.29886 8.7752 7.23605 8.99031L6.67805 10.9036C6.66132 10.961 6.66031 11.0218 6.67514 11.0797C6.68997 11.1376 6.72009 11.1904 6.76234 11.2327C6.8046 11.2749 6.85743 11.305 6.91532 11.3199C6.97321 11.3347 7.03401 11.3337 7.09138 11.317L9.00471 10.759C9.21982 10.6962 9.41563 10.5801 9.57405 10.4216L12.2494 7.74898Z" stroke="#FAFAFA" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
						<span>${_x('Bulk edit', 'button', 'smart-manager-for-wp-e-commerce')}</span>
					</button>
					<button id="sm-floating-duplicate-btn" class="inline-flex items-center gap-2 h-9 py-2 pl-2.5 pr-4 rounded-lg border-none font-['Inter',system-ui,sans-serif] text-sm font-medium leading-5 cursor-pointer transition-colors duration-150 whitespace-nowrap shadow-sm bg-[#262626] text-[#fafafa] hover:bg-[#333333] focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50">
						<svg class="shrink-0 w-4 h-4" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M13.3333 6H7.33333C6.59695 6 6 6.59695 6 7.33333V13.3333C6 14.0697 6.59695 14.6667 7.33333 14.6667H13.3333C14.0697 14.6667 14.6667 14.0697 14.6667 13.3333V7.33333C14.6667 6.59695 14.0697 6 13.3333 6Z" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
							<path d="M3.33334 10H2.66667C2.31305 10 1.97391 9.85953 1.72386 9.60948C1.47381 9.35943 1.33334 9.02029 1.33334 8.66667V2.66667C1.33334 2.31305 1.47381 1.97391 1.72386 1.72386C1.97391 1.47381 2.31305 1.33334 2.66667 1.33334H8.66667C9.02029 1.33334 9.35943 1.47381 9.60948 1.72386C9.85953 1.97391 10 2.31305 10 2.66667V3.33334" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
						<span>${_x('Duplicate', 'button', 'smart-manager-for-wp-e-commerce')}</span>
					</button>
					<button id="sm-floating-export-btn" class="inline-flex items-center gap-2 h-9 py-2 pl-2.5 pr-4 rounded-lg border-none font-['Inter',system-ui,sans-serif] text-sm font-medium leading-5 cursor-pointer transition-colors duration-150 whitespace-nowrap shadow-sm bg-[#262626] text-[#fafafa] hover:bg-[#333333] focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50">
						${window.smart_manager.getIcons('export','currentColor')}
						<span>${_x('Export selected', 'button', 'smart-manager-for-wp-e-commerce')}</span>
					</button>
					
					<button id="sm-print-invoice-btn" class="${['shop_order', 'shop_subscription'].includes(window.smart_manager.dashboardKey) || ['shop_order', 'shop_subscription'].includes(window.smart_manager.viewPostTypes[window.smart_manager.dashboardKey]) ? 'inline-flex ' : '!hidden'} items-center gap-2 h-9 py-2 pl-2.5 pr-4 rounded-lg border-none font-['Inter',system-ui,sans-serif] text-sm font-medium leading-5 cursor-pointer transition-colors duration-150 whitespace-nowrap shadow-sm bg-[#262626] text-[#fafafa] hover:bg-[#333333] focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50">
						<svg class="shrink-0 w-4 h-4" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M4 5.33333V1.33333H12V5.33333M4 12H2.66667C2.31304 12 1.97391 11.8595 1.72386 11.6095C1.47381 11.3594 1.33333 11.0203 1.33333 10.6667V7.33333C1.33333 6.97971 1.47381 6.64057 1.72386 6.39052C1.97391 6.14048 2.31304 6 2.66667 6H13.3333C13.687 6 14.0261 6.14048 14.2761 6.39052C14.5262 6.64057 14.6667 6.97971 14.6667 7.33333V10.6667C14.6667 11.0203 14.5262 11.3594 14.2761 11.6095C14.0261 11.8595 13.687 12 13.3333 12H12M4 9.33333H12V14.6667H4V9.33333Z" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
						<span>${_x('Print Invoice', 'button', 'smart-manager-for-wp-e-commerce')}</span>
					</button>
					
					<div class="flex-1 min-w-[1.25rem]"></div>
					<button id="sm-floating-delete-btn" class="inline-flex items-center gap-2 h-9 py-2 pl-2.5 pr-4 rounded-lg border-none font-['Inter',system-ui,sans-serif] text-sm font-medium leading-5 cursor-pointer transition-colors duration-150 whitespace-nowrap shadow-sm bg-transparent text-[#f87171] hover:bg-[#f87171]/10 focus:outline-none focus:ring-2 focus:ring-[#5850ec]/50">
						${window.smart_manager.getIcons('delete','currentColor')}
						<span>${_x('Delete', 'button', 'smart-manager-for-wp-e-commerce')}</span>
					</button>
				</div>
			</div>
		</div>`;
	}

	// Show the floating action bar
	SmartManager.prototype.showFloatingActionBar = function() {
		if (window.smart_manager.dashboardKey === 'product_stock_log') {
			return;
		}
		let selectedCount = window.smart_manager.selectAll ? window.smart_manager.displayTotalRecords : window.smart_manager.selectedRows.length;
		let dashboardName = window.smart_manager.dashboardDisplayName || _x('products', 'dashboard name', 'smart-manager-for-wp-e-commerce');
		// Use singular form for single selection
		if (selectedCount === 1) {
			dashboardName = dashboardName.replace(/s$/, '');
		}
		jQuery('#sm-floating-bar-count').text(`${window.smart_manager.selectAll ? `All` : selectedCount}`);
		jQuery('#sm-floating-bar-dashboard-name').text(dashboardName.toLowerCase());
		jQuery('#sm-floating-action-bar').removeClass('opacity-0 invisible translate-y-5 pointer-events-none').addClass('opacity-100 visible translate-y-0 pointer-events-auto');
	}

	// Hide the floating action bar
	SmartManager.prototype.hideFloatingActionBar = function() {
		jQuery('#sm-floating-action-bar').removeClass('opacity-100 visible translate-y-0 pointer-events-auto').addClass('opacity-0 invisible translate-y-5 pointer-events-none');
	}
		
	// Show/hide print invoice button

	// Function for displaying warning modal before doing export csv
	SmartManager.prototype.getExportCsv = function(args){
	    if(!args || !((Object.keys(args)).every(arg => args.hasOwnProperty(arg)))){
	        return;
	    }
	    
	    let hasSelectedRecords = window.smart_manager.selectedRows?.length > 0;
	    let allRecordsText = window.smart_manager.isFilteredData() ? _x('All (Search Results)', 'option', 'smart-manager-for-wp-e-commerce') : _x('All (Entire Store)', 'option', 'smart-manager-for-wp-e-commerce');
	    // Check if entire store option was clicked from dropdown
	    args.params.modalWidth = 'max-w-xl w-100'
	    // Build records selection - text for entire store, select for other cases
	    let recordsSelectionHtml = (args.id && args.id.includes('entire_store')) 
	        ? `<span class="font-medium text-sm-base-foreground">${allRecordsText}</span>
	           <input type="hidden" id="sm_export_records_select" value="all" />`
	        : `<select id="sm_export_records_select" class="inline-flex h-[1.75rem] border border-sm-base-input rounded-[0.375rem] bg-sm-base-background text-[0.875rem] text-sm-base-foreground font-medium cursor-pointer">
	                <option value="selected" ${!hasSelectedRecords ? 'disabled' : ''} ${hasSelectedRecords ? 'selected' : ''}>${_x('Selected', 'option', 'smart-manager-for-wp-e-commerce')}</option>
	                <option value="all" ${!hasSelectedRecords ? 'selected' : ''}>${allRecordsText}</option>
	            </select>`;
	    
	    // Build columns selection - dropdown for product dashboard (has stock option), text for others
	    // Check if stock option was clicked from dropdown
	    let isStockColumn = args.id && args.id.includes('stock');
	    let columnsSelectionHtml = (window.smart_manager.dashboardKey === 'product')
	        ? `<select id="sm_export_columns_select" class="inline-flex h-[1.75rem] border border-sm-base-input rounded-[0.375rem] bg-sm-base-background text-[0.875rem] text-sm-base-foreground font-medium cursor-pointer">
	                <option value="visible" ${!isStockColumn ? 'selected' : ''}>${_x('Visible', 'option', 'smart-manager-for-wp-e-commerce')}</option>
	                <option value="stock" ${isStockColumn ? 'selected' : ''}>${_x('Stock', 'option', 'smart-manager-for-wp-e-commerce')}</option>
	            </select>`
	        : `<span class="font-medium text-sm-base-foreground">${_x('Visible', 'option', 'smart-manager-for-wp-e-commerce')}</span>
	           <input type="hidden" id="sm_export_columns_select" value="visible" />`;
	    
	    // Build inline content with select dropdowns
	    args.params.content = `
	        <div class="flex flex-wrap items-center gap-[0.375rem] text-[0.875rem] leading-[1.5rem] text-sm-base-muted-foreground">
	            <span>${_x('Do you want to export', 'modal content', 'smart-manager-for-wp-e-commerce')}</span>
	            ${recordsSelectionHtml}
	            <span>${_x(' records ', 'modal content', 'smart-manager-for-wp-e-commerce')}</span>
	            <span>${_x('with ', 'modal content', 'smart-manager-for-wp-e-commerce')}</span>
	            ${columnsSelectionHtml}
	            <span>${_x('columns?', 'modal content', 'smart-manager-for-wp-e-commerce')}</span>
	        </div>
	    `;
	    
	    if("undefined" !== typeof(window.smart_manager.generateCsvExport) && "function" === typeof(window.smart_manager.generateCsvExport)){
	        args.params.btnParams.yesCallback = function() {
	            // Get values from dropdowns before export
	            let columnsType = jQuery('#sm_export_columns_select').val();
	            
	            // Show upgrade message for lite version when exporting with visible columns
	            if (window.smart_manager.sm_beta_pro == 0 && columnsType === 'visible') {
					window.smart_manager.notification = {
						status: 'warning',
						message: 
						sprintf(/* translators: %s is a link to the Pro version */
							_x('Please upgrade to %s to use this feature.', 'notification', 'smart-manager-for-wp-e-commerce'),
							'<a href="' + window.smart_manager.pricingPageURL + '" target="_blank">' + _x('Pro', 'notification', 'smart-manager-for-wp-e-commerce') + '</a>'
						),
						hideDelay: 5000
					};
	                window.smart_manager.showNotification();
	                return;
	            }
	            
	            window.smart_manager.exportStore = (jQuery('#sm_export_records_select').val() === 'all') ? (columnsType === 'stock' ? 'entire_store_stock_cols' : 'entire_store') : '';
	            window.smart_manager.columnsToBeExported = columnsType || 'visible';
	            window.smart_manager.generateCsvExport();
	        };
	    }
	    
	    if("undefined" !== typeof(window.smart_manager.showConfirmDialog) && "function" === typeof(window.smart_manager.showConfirmDialog)){
	        window.smart_manager.showConfirmDialog(args.params);
	    }
	}

	// ========================================================================
	// EXPORT CSV
	// ========================================================================

	SmartManager.prototype.generateCsvExport = function(data = {}) {

	    let params = {
	                            cmd: 'get_export_csv',
	                            active_module: window.smart_manager.dashboardKey,
	                            security: window.smart_manager.saCommonNonce,
	                            pro: true,
	                            SM_IS_WOO30: window.smart_manager.sm_is_woo30,
	                            sort_params: (window.smart_manager.currentDashboardModel.hasOwnProperty('sort_params') ) ? window.smart_manager.currentDashboardModel.sort_params : '',
	                            table_model: (window.smart_manager.currentDashboardModel.hasOwnProperty('tables') ) ? window.smart_manager.currentDashboardModel.tables : '',
	                            search_text: (window.smart_manager.searchType == 'simple') ? window.smart_manager.simpleSearchText : '',
							    advanced_search_query: JSON.stringify((window.smart_manager.searchType != 'simple') ? window.smart_manager.advancedSearchQuery : []),
	                            is_taxonomy: window.smart_manager.isTaxonomyDashboard() || 0,
	                            storewide_option: window.smart_manager.exportStore || '',
	                            selected_ids: (window.smart_manager.getSelectedKeyIds()) ? JSON.stringify(window.smart_manager.getSelectedKeyIds()) : '',
	                            columnsToBeExported: window.smart_manager.columnsToBeExported || ''
	                          };
	    //Code for handling views
	    let viewSlug = window.smart_manager.getViewSlug(window.smart_manager.dashboardName);

	    if(viewSlug){
	        params['is_view'] = 1;
	        params['active_view'] = viewSlug;
	        params['active_module'] = (window.smart_manager.viewPostTypes.hasOwnProperty(viewSlug)) ? window.smart_manager.viewPostTypes[viewSlug] : window.smart_manager.dashboardKey;
	    }
	if(data.hasOwnProperty('isScheduledExport') && data.isScheduledExport === true && data.hasOwnProperty('scheduleParams') && data.hasOwnProperty('scheduleExportAjaxCallback') && typeof data.scheduleExportAjaxCallback === 'function'){
			params.is_scheduled_export = data?.isScheduledExport || false;
			params.scheduled_export_params = data?.scheduleParams || false;
			params.selected_ids = params.storewide_option = params.advanced_search_query = params.search_text = '';
			window.smart_manager.sendRequest({data:params,data_type: 'json'},data.scheduleExportAjaxCallback)
			return;
		}

	    let export_url = window.smart_manager.commonManagerAjaxUrl + '&cmd='+ params['cmd'] +'&active_module='+ params['active_module'] +'&security='+ params['security'] +'&pro='+ params['pro'] +'&SM_IS_WOO30='+ params['SM_IS_WOO30'] +'&is_taxonomy='+ params['is_taxonomy'] +'&sort_params='+ encodeURIComponent(JSON.stringify(params['sort_params'])) +'&table_model='+ encodeURIComponent(JSON.stringify(params['table_model'])) +'&advanced_search_query='+params['advanced_search_query']+'&search_text='+ params['search_text'] + '&storewide_option=' + params['storewide_option'] + '&selected_ids=' + params['selected_ids'] + '&columnsToBeExported=' + params['columnsToBeExported'];
	    export_url += ( window.smart_manager.date_params && window.smart_manager.date_params.hasOwnProperty('date_filter_params') ) ? '&date_filter_params='+ window.smart_manager.date_params['date_filter_params'] : '';
	    export_url += ( window.smart_manager.date_params && window.smart_manager.date_params.hasOwnProperty('date_filter_query') ) ? '&date_filter_query='+ window.smart_manager.date_params['date_filter_query'] : '';

	    if(viewSlug){
	        export_url += '&is_view='+params['is_view']+'&active_view='+params['active_view'];
	    }

	    setTimeout(()=>{window.location = export_url},500);
	}

// Function for displaying confirm dialog for unsaved changes.
	SmartManager.prototype.confirmUnsavedChanges = function(params ={}) {
			try{
				window.smart_manager.modal = {
					title: _x('Attention!', 'modal title', 'smart-manager-for-wp-e-commerce'),
					content: '<div> <div>'+
						_x('You have unsaved changes. Are you sure you want to continue?', 'modal content', 'smart-manager-for-wp-e-commerce')+'</div></div>',
					autoHide: false,
					cta: {
						title: _x('Yes', 'button', 'smart-manager-for-wp-e-commerce'),
						//closeModalOnClick: (params.hasOwnProperty('hideOnYes')) ? params.hideOnYes : true,
						callback: function() {
							 setTimeout(() => { // TODO: improve it
								if(params.hasOwnProperty('modalVals')){
									window.smart_manager.modal = params.modalVals
								}
								if(params.hasOwnProperty('yesCallback') && typeof params.yesCallback === "function"){
									if(params.hasOwnProperty('yesCallbackParams')){
										params.yesCallback( params.yesCallbackParams );
									}else{
										params.yesCallback();
									}
								}
							 },300)
						}
					},
					closeCTA: { title: _x('No', 'button', 'smart-manager-for-wp-e-commerce'),
						callback: function() {
							if( params.hasOwnProperty('noCallback') && typeof params.noCallback === "function" ) {
								params.noCallback();
							}
						}
					}
				}
				window.smart_manager.showModal()
			}
			catch(e){
				SaErrorHandler.log('Exception occurred in confirmUnsavedChanges:: ', e)
			}
	}
	// Function to show man-hrs saved message, post inline-update in lite version
	SmartManager.prototype.showManHoursSaved = function(params ={}) {
		try{
			window.smart_manager.modal = {
				title: _x( params.hasOwnProperty('title')?params.title:"", 'modal title', 'smart-manager-for-wp-e-commerce'),
				content: '<div> <div style="margin-bottom:1em;">'+
					_x( params.hasOwnProperty('message')?params.message:"", 'modal content', 'smart-manager-for-wp-e-commerce')+'</div></div>',
				hideFooter:true,
				autoHide: false,
				isFooterItemsCenterAligned: true
			}
			window.smart_manager.showModal()
		}
		catch(e){
			SaErrorHandler.log('Exception occurred in showManHoursSaved:: ', e)
		}
	}
	// Function for updating Advanced Search rule count.
	SmartManager.prototype.updateAdvancedSearchRuleCount = function(){
		if(!window.smart_manager.advancedSearchQuery || !window.smart_manager.advancedSearchQuery.length > 0){
			return;
		}
        let firstQuery = window.smart_manager.advancedSearchQuery[0];
        if(Object.keys(firstQuery).length > 0){
            let rules = firstQuery.hasOwnProperty('rules') ? firstQuery.rules : [];
            if(rules.length > 0){
                rules.forEach(ruleSet => {
                    window.smart_manager.advancedSearchRuleCount += ruleSet.rules.length;
                });
        	}
        }
	}
	// Generate final checkbox list for multilist data for inline edit.
	SmartManager.prototype.generateCheckboxList = function(multiselect_data = {}, selectedValues = []){
		if(!multiselect_data){
			return;
		}
		let html = '<ul id="sm-multilist-data">';
		Object.keys(multiselect_data).forEach((key) => {
			let data = multiselect_data[key];
			let checked = (selectedValues) && ((selectedValues.includes(data.term) || selectedValues.includes(data.id.toString()))) ? 'checked' : '';
			html += `<li class="mt-2 text-sm-base-foreground"><input type="hidden" name="chk_multiselect" value="${data.term}" class="sm-title-input"><input type="checkbox" name="chk_multiselect" value="${data.id}" ${checked}> ${data.term}`;
			// Recursively add child data
			if(data.child && Object.keys(data.child).length > 0){
				html += '<ul class="children">'+window.smart_manager.generateCheckboxList(data.child, selectedValues)+'</ul>';
			}
			html += '</li>';
		});
		html += '</ul>';
		return html;
	}

	//Function to convert special characters into HTML characters.
	SmartManager.prototype.decodeHTMLString = function (str = '', isCategoryName = false) {
		if ('' === str.trim()) {
			return str;
		}
		// Decode HTML entities using DOMParser.
		const decodedStr = new DOMParser().parseFromString(str, 'text/html').documentElement.textContent;
		// Replace the ? sequence with >
		return (isCategoryName === true) ? decodedStr.replace(/\u0080\?/g, '>') : decodedStr;
	}

	SmartManager.prototype.showWSMStockLogImportModal = function(recordCount = 150) {
		let params = {};
		params.btnParams = {};
		
		params.title = _x('Sync Stock Log Data', 'modal title', 'smart-manager-for-wp-e-commerce');
		params.width = 550;
		params.height = 'auto';
		
		params.content = `
			<div class="sm-wsm-stock-log-import-modal-content">
				<div class="sm-wsm-stock-log-import-confirmation">
					<p class="sm-wsm-import-question m-0">
							${_x('Are you sure you want to sync stock log data from', 'modal content', 'smart-manager-for-wp-e-commerce')} 
							<a href="https://wordpress.org/plugins/woocommerce-stock-manager/" target="_blank">Stock Manager for WooCommerce</a>
							${_x('into Smart Manager?', 'modal content', 'smart-manager-for-wp-e-commerce')} 
					</p>
				</div>
				
				<div class="sm-wsm-import-notes">
					<h4>${_x('Please Note:', 'section heading', 'smart-manager-for-wp-e-commerce')}</h4>
					<ul class="ml-4 sm-wsm-import-notes-list">
						<li>
							${_x('Synced records will <strong class="text-sm-base-foreground">not support the Undo feature</strong>.', 'modal content', 'smart-manager-for-wp-e-commerce')}
						</li>
						<li>
							${_x(`Some field data (such as author and previous values) may be missing because this information was not captured by the Stock Manager for WooCommerce plugin.`, 'modal content', 'smart-manager-for-wp-e-commerce')}
						</li>
					</ul>
				</div>
				
				<div id="sm_wsm_import_error_msg" class="notice notice-error" style="display:none;"></div>
			</div>`;
		
		if (typeof (window.smart_manager.importWSMStockLog) !== "undefined" && typeof (window.smart_manager.importWSMStockLog) === "function") {
			params.btnParams.yesText = _x('Sync Now', 'button text', 'smart-manager-for-wp-e-commerce');
			params.btnParams.noText = _x('Cancel', 'button text', 'smart-manager-for-wp-e-commerce');
			params.btnParams.yesCallback = window.smart_manager.importWSMStockLog;
			params.btnParams.hideOnYes = false;
		}
		
		window.smart_manager.showConfirmDialog(params);
	}

	SmartManager.prototype.importWSMStockLog = function() {
		setTimeout(() => {
			window.smart_manager.showProgressDialog(_x('Stock Log Synchronization', 'progressbar modal title', 'smart-manager-for-wp-e-commerce'));
			if (typeof sa_background_process_heartbeat === "function") {
				sa_background_process_heartbeat(1000, 'Stock Log Synchronization', window.pluginKey);
			}
		}, 1);
		window.smart_manager.sendRequest(
			{ 
				data:{
					cmd: 'initiate_wsm_stock_log_import_process',
					active_module: window.smart_manager.dashboardKey,
					security: window.smart_manager.saCommonNonce,
					active_module_title: window.smart_manager.dashboardName,
					background_process_running_message: window.smart_manager.backgroundProcessRunningMessage
				},
				showLoader: false
			}, function (response) {
        	}
		);
	}

	// ============================================
	// Action Column Functions for Grid
	// ============================================

	// Get the edit URL for a record
	SmartManager.prototype.getRecordEditUrl = function(recordId) {
		// Extract URL from anchor HTML string
		const editLinkHtml = window.smart_manager.currentDashboardData[recordId]?.custom_edit_link || '';
		const match = editLinkHtml.match(/href="([^"]+)"/);
		return match ? match[1] : '';
	}

	// Get the view URL for a record
	SmartManager.prototype.getRecordViewUrl = function(recordId) {
		const editLinkHtml = window.smart_manager.currentDashboardData[recordId]?.custom_view_link || '';
		const match = editLinkHtml.match(/href="([^"]+)"/);
		return match ? match[1] : '';
	}

	// Handle action column item click
	SmartManager.prototype.handleActionColumnClick = function(action, row) {	
		switch(action) {
			case 'view':
				const viewUrl = window.smart_manager.getRecordViewUrl(row);
				if (viewUrl) window.open(viewUrl, '_blank');
				break;
			case 'edit':
				const editUrl = window.smart_manager.getRecordEditUrl(row);
				if (editUrl) window.open(editUrl, '_blank');
				break;
			case 'delete':
				// Select this row and trigger delete
				window.smart_manager.selectedRows = [row];
				window.smart_manager.selectAll = false;
				
				// Use common delete confirmation modal
				let isTasksView = window.smart_manager.isTasksViewActive === true;
				window.smart_manager.showDeleteConfirmModal({
					recordsText: _x('this record', 'modal content', 'smart-manager-for-wp-e-commerce'),
					showTrashOption: window.smart_manager.trashEnabled,
					isTasksView: isTasksView
				});
				break;
		}
	}

	// Create global action dropdown (single instance)
	SmartManager.prototype.createActionDropdown = function() {
		if (document.getElementById('sm-action-dropdown')) return;
		var dropdown = document.createElement('div');
		dropdown.id = 'sm-action-dropdown';
		dropdown.className = 'hidden fixed min-w-[8.75rem] bg-white border border-[#E5E5E5] rounded-md shadow-lg z-[120002]';
		dropdown.innerHTML = `<a href="#" data-action="view" class="flex items-center gap-2 px-3.5 py-2.5 text-[#333] no-underline text-[0.8125rem] font-medium hover:bg-[#F5F5F5] rounded-t-md"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>View</a><a href="#" data-action="edit" class="flex items-center gap-2 px-3.5 py-2.5 text-[#333] no-underline text-[0.8125rem] font-medium hover:bg-[#F5F5F5]"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>Edit</a><a href="#" data-action="delete" class="flex items-center gap-2 px-3.5 py-2.5 text-red-600 no-underline text-[0.8125rem] font-medium hover:bg-red-50 rounded-b-md">${window.smart_manager.getIcons('delete','#DC2626')}Delete</a>`;
		document.body.appendChild(dropdown);
		
		// Handle dropdown item clicks
		dropdown.addEventListener('click', function(e) {
			var target = e.target.closest('[data-action]');
			if (target && window.smart_manager && window.smart_manager.handleActionColumnClick) {
				window.smart_manager.handleActionColumnClick(target.dataset.action, window.smart_manager.activeActionRow);
			}
			dropdown.classList.add('hidden');
		});
		
		// Close on outside click
		document.addEventListener('click', function(e) {
			if (!e.target.closest('#sm-action-dropdown') && !e.target.closest('.sm-action-btn')) {
				var dd = document.getElementById('sm-action-dropdown');
				if (dd) dd.classList.add('hidden');
			}
		});
	}

	// Toggle dropdown and position it
	SmartManager.prototype.toggleGridRowActionDropdown = function(btn, row, e) {
		// Prevent default and stop propagation to avoid Handsontable cell selection/scrolling
		if (e) {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
		}
		
		// Do not show row action dropdown for product_stock_log dashboard
		if (window.smart_manager.dashboardKey === 'product_stock_log') {
			return;
		}
		
		if (typeof window.smart_manager.createActionDropdown === 'function') {
			window.smart_manager.createActionDropdown();
		}
		var dropdown = document.getElementById('sm-action-dropdown');
		
		// If clicking the same row's button and dropdown is open, just close it
		if (!dropdown.classList.contains('hidden') && (window.smart_manager.activeActionRow === row)) {
			dropdown.classList.add('hidden');
			return;
		}
		
		// Position and show dropdown
		var rect = btn.getBoundingClientRect();
		window.smart_manager.activeActionRow = row;
		dropdown.style.top = (rect.bottom + 2) + 'px';
		dropdown.style.left = (rect.right - 140) + 'px';
		dropdown.classList.remove('hidden');
	}

	// Open column manager from action header
	SmartManager.prototype.openColumnManager = function() {
		if ((typeof window.smart_manager.dirtyRowColIds !== 'undefined') && Object.getOwnPropertyNames(window.smart_manager.dirtyRowColIds).length > 0) {
			window.smart_manager.confirmUnsavedChanges({ 'yesCallback': window.smart_manager.showPannelDialog, 'yesCallbackParams': window.smart_manager.columnManagerRoute, 'hideOnYes': false });
		} else if (typeof window.smart_manager.showPannelDialog === 'function') {
			window.smart_manager.showPannelDialog(window.smart_manager.columnManagerRoute);
		}
	}

	// Create quick column manager floating panel
	SmartManager.prototype.createQuickColumnManagerPanel = function() {
		if (document.getElementById('sm-quick-column-manager')) return;
		
		const panel = document.createElement('div');
		panel.id = 'sm-quick-column-manager';
		panel.className = 'hidden fixed z-[9999] bg-white rounded-lg shadow-md border border-[#e5e5e5] w-[14.375rem] overflow-hidden flex flex-col sm-custom-scrollbar';
		panel.innerHTML = `
			<div class="bg-white sticky top-0 z-[3] px-1 pt-1">
				<div class="px-2 py-1.5 text-xs text-[#737373]">
					${_x('Manage columns', 'quick column manager title', 'smart-manager-for-wp-e-commerce')}
				</div>
			</div>
			<ul id="sm-quick-column-list" class="px-1 overflow-y-auto max-h-[20rem] md:max-h-[18rem] flex flex-col"></ul>
			<div class="bg-white border-t border-[#e5e5e5] p-2 z-[1]">
				<button id="sm-open-full-column-manager" class="w-full flex items-center justify-center gap-1.5 h-8 px-3 py-2 text-xs font-medium text-[#0a0a0a] bg-white hover:bg-[#f5f5f5] border border-[#e5e5e5] rounded-lg shadow-sm transition-colors cursor-pointer">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.335 6.66667V2C13.335 1.26362 12.7381 0.666667 12.0017 0.666667H2.00171C1.26533 0.666667 0.668375 1.26362 0.668375 2V12C0.668375 12.7364 1.26533 13.3333 2.00171 13.3333H7.00171M4.66838 0.666667V13.3333M9.33504 0.666667V7.33333M9.30804 11.3333H14.0221M11.6651 14.0223V9.30825" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/></svg>
					${_x('Open Column Manager', 'button', 'smart-manager-for-wp-e-commerce')}
				</button>
			</div>
		`;
		document.body.appendChild(panel);
		
		// Open full column manager button
		document.getElementById('sm-open-full-column-manager').onclick = function(e) {
			e.preventDefault();
			e.stopPropagation();
			panel.classList.add('hidden');
			if (typeof window.smart_manager.openColumnManager === 'function') {
				window.smart_manager.openColumnManager();
			}
		};
		
		// Close on outside click
		document.addEventListener('click', function(e) {
			if (!e.target.closest('#sm-quick-column-manager') && !e.target.closest('.sm-action-header-btn')) {
				panel.classList.add('hidden');
			}
		});
	}

	// Build quick column manager list
	SmartManager.prototype.buildQuickColumnList = function() {
		const listEl = document.getElementById('sm-quick-column-list');
		if (!listEl) return;
		
		let html = '';
		// Use currentVisibleColumns to show ONLY visible columns
		const columns = window.smart_manager.currentVisibleColumns || [];
		
		columns.forEach((col, index) => {
			// Skip columns without name or data
			if (!col.data && !col.name) return;
			// Skip action column
			if (col.data === 'sm_action_column') return;
			
			const colName = col.name_display || col.name || col.data || '';
			const colSrc = col.src || col.data || '';
			
			html += `
				<li class="group w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#f5f5f5] cursor-grab" data-col-index="${index}" data-col-src="${colSrc}" draggable="true">
					<div class="shrink-0 w-4 h-4 text-[#9ca3af]">
						<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="4" r="1.25"/><circle cx="10" cy="4" r="1.25"/><circle cx="6" cy="8" r="1.25"/><circle cx="10" cy="8" r="1.25"/><circle cx="6" cy="12" r="1.25"/><circle cx="10" cy="12" r="1.25"/></svg>
					</div>
					<button type="button" class="sm-quick-col-toggle shrink-0 w-4 h-4 rounded border bg-[#6b63f1] border-[#6b63f1] shadow-sm flex items-center justify-center cursor-pointer" data-col-index="${index}" data-checked="true">
						<svg class="w-3.5 h-3.5 text-white" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.6667 3.5L5.25 9.91667L2.33333 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
					</button>
					<span class="sm-col-name flex-1 text-sm text-[#0a0a0a] truncate leading-5" title="${colName}">${colName}</span>
					<button type="button" class="sm-quick-col-edit shrink-0 w-5 h-5 rounded flex items-center justify-center text-[#9ca3af] hover:text-[#6b63f1] hover:bg-[#e5e5e5] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" data-col-index="${index}" title="${_x('Edit column name', 'tooltip', 'smart-manager-for-wp-e-commerce')}">
						<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.41667 2.33333H2.33333C1.97971 2.33333 1.64057 2.47381 1.39052 2.72386C1.14048 2.97391 1 3.31304 1 3.66667V11.6667C1 12.0203 1.14048 12.3594 1.39052 12.6095C1.64057 12.8595 1.97971 13 2.33333 13H10.3333C10.687 13 11.0261 12.8595 11.2761 12.6095C11.5262 12.3594 11.6667 12.0203 11.6667 11.6667V7.58333M10.7917 1.45833C11.0571 1.19291 11.4156 1.04398 11.7896 1.04398C12.1635 1.04398 12.522 1.19291 12.7875 1.45833C13.0529 1.72375 13.2018 2.08228 13.2018 2.45625C13.2018 2.83022 13.0529 3.18875 12.7875 3.45417L6.99167 9.25L4.66667 9.83333L5.25 7.50833L10.7917 1.45833Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
					</button>
				</li>
			`;
		});
		
		listEl.innerHTML = html;
		
		// Add toggle event listeners (to hide columns)
		listEl.querySelectorAll('.sm-quick-col-toggle').forEach(btn => {
			btn.onclick = function(e) {
				e.preventDefault();
				e.stopPropagation();
				const colIndex = parseInt(this.dataset.colIndex);
				const isCurrentlyChecked = this.dataset.checked === 'true';
				
				if (isCurrentlyChecked) {
					// Hide the column
					window.smart_manager.toggleColumnVisibility(colIndex, false);
					// Remove this item from the list
					const li = this.closest('li');
					if (li) li.remove();
				}
			};
		});
		
		// Add edit event listeners
		listEl.querySelectorAll('.sm-quick-col-edit').forEach(btn => {
			btn.onclick = function(e) {
				e.preventDefault();
				e.stopPropagation();
				const colIndex = parseInt(this.dataset.colIndex);
				const listItem = this.closest('li');
				window.smart_manager.editQuickColumnName(colIndex, listItem);
			};
		});
		
		// Add drag and drop functionality
		window.smart_manager.initQuickColumnDragDrop();
	}

	// Edit column name inline (for quick column manager)
	SmartManager.prototype.editQuickColumnName = function(colIndex, listItem) {
		if (!listItem || !window.smart_manager.currentVisibleColumns[colIndex]) return;
		
		const col = window.smart_manager.currentVisibleColumns[colIndex];
		const currentName = col.name_display || col.name || '';
		const labelSpan = listItem.querySelector('.sm-col-name');
		
		if (!labelSpan) return;
		
		// Create input
		const input = document.createElement('input');
		input.type = 'text';
		input.value = currentName;
		input.className = 'w-full flex-1 px-1.5 py-0.5 text-sm border border-[#6b63f1] rounded focus:outline-none focus:ring-1 focus:ring-[#6b63f1]';
		
		// Hide original span and edit button, show input
		labelSpan.style.display = 'none';
		const editBtn = listItem.querySelector('.sm-quick-col-edit');
		if (editBtn) editBtn.style.display = 'none';
		labelSpan.parentNode.insertBefore(input, labelSpan.nextSibling);
		input.focus();
		input.select();
		
		// Save on blur or enter
		const saveChanges = function() {
			const newName = input.value.trim();
			if (newName && newName !== currentName) {
				// Update visible columns model
				window.smart_manager.currentVisibleColumns[colIndex].name_display = newName;
				window.smart_manager.currentVisibleColumns[colIndex].name = newName;
				window.smart_manager.currentVisibleColumns[colIndex].key = newName;
				
				// Also update in currentColModel
				const colSrc = col.src || col.data;
				if (colSrc && window.smart_manager.currentColModel) {
					window.smart_manager.currentColModel.forEach(function(c) {
						if (c.src === colSrc || c.data === colSrc) {
							c.name_display = newName;
							c.name = newName;
							c.key = newName;
						}
					});
				}
				
				// Track edited column titles
				const colData = col.data || '';
				if (colData) {
					window.smart_manager.editedColumnTitles = window.smart_manager.editedColumnTitles || {};
					window.smart_manager.editedColumnTitles[colData] = newName;
				}
				
				// Update display
				labelSpan.textContent = newName;
				
				// Update column headers in grid
				window.smart_manager.column_names[colIndex] = newName;
				if (window.smart_manager.hot) {
					window.smart_manager.hot.render();
				}
			}
			
			// Restore original display
			labelSpan.style.display = '';
			if (editBtn) editBtn.style.display = '';
			input.remove();
		};
		
		input.onblur = saveChanges;
		input.onkeydown = function(e) {
			if (e.key === 'Enter') {
				e.preventDefault();
				saveChanges();
			} else if (e.key === 'Escape') {
				labelSpan.style.display = '';
				if (editBtn) editBtn.style.display = '';
				input.remove();
			}
		};
	}

	// Initialize drag and drop for quick column manager
	SmartManager.prototype.initQuickColumnDragDrop = function() {
		const listEl = document.getElementById('sm-quick-column-list');
		if (!listEl) return;
		
		let draggedItem = null;
		
		listEl.querySelectorAll('li[draggable="true"]').forEach(item => {
			item.ondragstart = function(e) {
				draggedItem = this;
				this.classList.add('opacity-50');
				e.dataTransfer.effectAllowed = 'move';
			};
			
			item.ondragend = function() {
				this.classList.remove('opacity-50');
				draggedItem = null;
				listEl.querySelectorAll('li').forEach(li => li.classList.remove('border-t-2', 'border-indigo-400'));
			};
			
			item.ondragover = function(e) {
				e.preventDefault();
				if (draggedItem && draggedItem !== this) {
					this.classList.add('border-t-2', 'border-indigo-400');
				}
			};
			
			item.ondragleave = function() {
				this.classList.remove('border-t-2', 'border-indigo-400');
			};
			
			item.ondrop = function(e) {
				e.preventDefault();
				this.classList.remove('border-t-2', 'border-indigo-400');
				if (draggedItem && draggedItem !== this) {
					// Reorder in currentColModel
					window.smart_manager.reorderColumn(parseInt(draggedItem.dataset.colIndex), parseInt(this.dataset.colIndex));
					// Rebuild the list
					window.smart_manager.buildQuickColumnList();
				}
			};
		});
	}

	// Reorder column in model
	SmartManager.prototype.reorderColumn = function(fromIndex, toIndex) {
		if (!window.smart_manager.currentColModel) return;
		
		const colModel = window.smart_manager.currentColModel;
		const [movedCol] = colModel.splice(fromIndex, 1);
		colModel.splice(toIndex, 0, movedCol);
		
		// Update positions
		colModel.forEach((col, idx) => {
			col.position = idx + 1;
		});
		
		// Rebuild visible columns
		window.smart_manager.rebuildVisibleColumns();
	}

	// Toggle column visibility
	SmartManager.prototype.toggleColumnVisibility = function(colIndex, isVisible) {
		if (!window.smart_manager.currentColModel || !window.smart_manager.currentColModel[colIndex]) return;
		
		const colObj = window.smart_manager.currentColModel[colIndex];
		colObj.hidden = !isVisible;
		
		// Rebuild visible columns and refresh grid
		window.smart_manager.rebuildVisibleColumns();
	}

	// Rebuild visible columns from currentColModel
	SmartManager.prototype.rebuildVisibleColumns = function() {
		window.smart_manager.column_names = [];
		window.smart_manager.currentVisibleColumns = [];
		
		let index = 0;
		window.smart_manager.currentColModel.forEach(function(colObj) {
			const hidden = (typeof colObj.hidden !== 'undefined') ? colObj.hidden : true;
			
			if (hidden === false) {
				window.smart_manager.column_names[index] = colObj.name_display || colObj.name || '';
				window.smart_manager.currentVisibleColumns[index] = colObj;
				index++;
			}
		});
		
		// Re-add action column
		window.smart_manager.addActionColumn();
		
		// Update grid
		if (window.smart_manager.hot) {
			window.smart_manager.hot.updateSettings({
				columns: window.smart_manager.currentVisibleColumns,
				colHeaders: window.smart_manager.column_names
			});
		}
		
		// Update state
		if (typeof window.smart_manager.updateState === 'function') {
			window.smart_manager.updateState({isTasksEnabled:window.smart_manager.isTasksEnabled()});
		}
	}

	// Toggle quick column manager panel
	SmartManager.prototype.toggleQuickColumnManager = function(btn, e) {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		
		if (typeof window.smart_manager.createQuickColumnManagerPanel === 'function') {
			window.smart_manager.createQuickColumnManagerPanel();
		}
		
		const panel = document.getElementById('sm-quick-column-manager');
		if (!panel) return;
		
		if (panel.classList.contains('hidden')) {
			// Build the list
			window.smart_manager.buildQuickColumnList();
			// Position the panel
			const rect = btn.getBoundingClientRect();
			panel.style.top = (rect.bottom + 4) + 'px';
			panel.style.right = (window.innerWidth - rect.right) - 4 + 'px';
			panel.style.left = 'auto';
			panel.classList.remove('hidden');
		} else {
			panel.classList.add('hidden');
		}
	}

	SmartManager.prototype.getIcons = function(slug='', stroke=''){
		switch (slug) {
			case ('undo'):
				return `<svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.665039 0.664978V4.66498M0.665039 4.66498H4.66504M0.665039 4.66498L2.66504 2.86498C3.76427 1.87908 5.18845 1.33315 6.66504 1.33164C8.25634 1.33164 9.78246 1.96379 10.9077 3.089C12.0329 4.21422 12.665 5.74035 12.665 7.33164" stroke="${stroke}" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/></svg>`
			case ('delete'):
				return `<svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.665039 3.33164H12.665M11.3317 3.33164V12.665C11.3317 13.3316 10.665 13.9983 9.99837 13.9983H3.33171C2.66504 13.9983 1.99837 13.3316 1.99837 12.665V3.33164M3.99837 3.33164V1.99831C3.99837 1.33164 4.66504 0.664978 5.33171 0.664978H7.99837C8.66504 0.664978 9.33171 1.33164 9.33171 1.99831V3.33164M5.33171 6.66498V10.665M7.99837 6.66498V10.665" stroke="${stroke}" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/></svg>`
			case ('export'):
				return `<svg width="15" height="12" viewBox="0 0 15 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.99837 1.99831C1.64475 1.99831 1.30561 2.13879 1.05556 2.38884C0.805515 2.63888 0.665039 2.97802 0.665039 3.33164V9.99831C0.665039 10.3519 0.805515 10.6911 1.05556 10.9411C1.30561 11.1912 1.64475 11.3316 1.99837 11.3316H12.665C13.0187 11.3316 13.3578 11.1912 13.6078 10.9411C13.8579 10.6911 13.9984 10.3519 13.9984 9.99831V3.33164C13.9984 2.97802 13.8579 2.63888 13.6078 2.38884C13.3578 2.13879 13.0187 1.99831 12.665 1.99831M7.33171 8.66498V0.664978M7.33171 0.664978L4.66504 3.33164M7.33171 0.664978L9.99837 3.33164" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"></path></svg>`
			case ('close'):
				return `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 3L3 9M3 3L9 9" stroke="#737373" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/></svg>`
			case ('plus'):
				return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5V19M5 12H19" stroke="#737373" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
			default:
				return '';
		}
	}

	// Register an alias for datetime
	Handsontable.cellTypes.registerCellType('sm.datetime', {
		editor: dateTimeEditor,
		renderer: datetimeRenderer,
		allowInvalid: true,
	});

	// Register an alias for date
	Handsontable.cellTypes.registerCellType('sm.date', {
		editor: dateEditor,
		renderer: datetimeRenderer,
		allowInvalid: true,
	});

	// Register an alias for time
	Handsontable.cellTypes.registerCellType('sm.time', {
		editor: timeEditor,
		renderer: datetimeRenderer,
		allowInvalid: true,
	});

	// Register an alias for image
	Handsontable.cellTypes.registerCellType('sm.image', {
		renderer: imageRenderer,
		allowInvalid: true,
	});

	// Register an alias for multiple gallery images
	Handsontable.cellTypes.registerCellType('sm.multipleImage', {
		// renderer: Handsontable.renderers.HtmlRenderer,
		renderer: multipleImageRenderer,
		allowInvalid: true,
	});

	// Register an alias for longstrings
	Handsontable.cellTypes.registerCellType('sm.longstring', {
		editor: defaultTextEditor,
		renderer: multilistRenderer,
		allowInvalid: true,
	});

	// Register an alias for serialized
	Handsontable.cellTypes.registerCellType('sm.serialized', {
		editor: defaultTextEditor,
		renderer: multilistRenderer,
		allowInvalid: true,
	});

	// Register an alias for multilist
	Handsontable.cellTypes.registerCellType('sm.multilist', {
		editor: defaultTextEditor,
		renderer: multilistRenderer,
		allowInvalid: true,
	});

	// Action column renderer - renders different buttons based on view mode
	function actionColumnRenderer(instance, td, row, col, prop, value, cellProperties) {
		const isTasksView = window.smart_manager.isTasksViewActive === true || window.location.search.includes('show_edit_history');
		
		if (isTasksView) {
			// History/Tasks view - show Undo and Delete buttons
			td.innerHTML = `
				<div class="inline-flex items-center justify-center gap-1 ml-4 mb-3">
					<button type="button" class="sm-history-undo-btn inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E5E5E5] bg-white text-xs font-medium text-sm-base-foreground cursor-pointer hover:bg-[#F5F5F5] transition-colors" data-row="${row}" onmousedown="event.stopPropagation();" onclick="event.preventDefault();event.stopPropagation();window.smart_manager.undoHistoryRow(${row});return false;">
						${window.smart_manager.getIcons('undo','#0A0A0A')}
						<span>Undo</span>
					</button>
					<button type="button" class="sm-history-delete-btn flex items-center justify-center w-7 h-7 rounded border-none bg-transparent text-[#DC2626] cursor-pointer hover:bg-red-50 transition-colors" data-row="${row}" onmousedown="event.stopPropagation();" onclick="event.preventDefault();event.stopPropagation();window.smart_manager.deleteHistoryRow(${row});return false;">
						${window.smart_manager.getIcons('delete','#DC2626')}
					</button>
				</div>
			`;
		} else {
			// Normal view - show kebab menu button
			td.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:var(--row-height);"><button type="button" class="sm-action-btn flex items-center justify-center w-7 h-7 border-none bg-transparent rounded cursor-pointer text-[#737373] hover:bg-[#F0F0F0] hover:text-[#333]" onmousedown="event.stopPropagation();" onclick="event.preventDefault();event.stopPropagation();window.smart_manager.toggleGridRowActionDropdown(this,' + row + ',event);return false;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg></button></div>';
		}
		
		td.classList.add('!sticky', '!right-0', 'z-[99]', '!bg-white', 'border-l', 'border-[#E5E5E5]', '!p-0', '!overflow-visible');
		return td;
	}

	function generateImageHtml(params = {}){
		if(!params.td || !params.value || !params.cellProperties || !params.currentInstance){
			return
		}

		let escaped = Handsontable.helper.stringify(params.value),
			img,
			className = ((params.className) ? (params.className + ' ') : '') + 'sm_image_thumbnail';
		if (escaped.indexOf('http') === 0) {
			img = document.createElement('IMG');
			img.src = params.value;
			img.width = 30;
			img.height = 30;

			img.setAttribute('class',className);

			Handsontable.dom.addEvent(img, 'mousedown', function (e){
				e.preventDefault(); // prevent selection quirk
			});

			// Handsontable.dom.empty(td);
			params.td.appendChild(img);
		}
		else {
			// render as text
			Handsontable.renderers.TextRenderer.apply(params.currentInstance, arguments);
		}

		if( typeof(params.cellProperties.className) != 'undefined' ) {
				className += ' '+ params.cellProperties.className;
				params.td.setAttribute('class',params.cellProperties.className);
		}

		return params.td
	}

	function imageRenderer(hotInstance, td, row, column, prop, value, cellProperties) {
		try{
			value = (!value || value == 0) ? window.smart_manager.defaultImagePlaceholder : value
			Handsontable.dom.empty(td);
			td = generateImageHtml({
				td: td,
				value: value,
				cellProperties: cellProperties,
				currentInstance: this
			})
			td.innerHTML = '<div class="wrapper">' + td.innerHTML + '</div>';
		}catch(e){
			console.log('imageRenderer:: ', e)
		}
		return td;
	}

	function multipleImageRenderer(hotInstance, td, row, column, prop, value, cellProperties) {
		try{
			value = (!Array.isArray(value)) ? [] : value;
			value = (value.length === 0) ? [{id:0, val:window.smart_manager.defaultImagePlaceholder}] : value
			Handsontable.dom.empty(td);
			value.map((obj) => {
				td = generateImageHtml({
					td: td,
					value: obj.val || '',
					cellProperties: cellProperties,
					currentInstance: this
				})
			})
			td.innerHTML = '<div class="wrapper">' + td.innerHTML + '</div>';
		}catch(e){
			console.log('multipleImageRenderer:: ', e)
		}
		return td;
	}
	// Register action column cell type
	Handsontable.cellTypes.registerCellType('sm.action', {
		renderer: actionColumnRenderer,
		readOnly: true,
		allowInvalid: true,
	});

})(Handsontable);
