(function (window) {
    function SaCommonManager() {}
    SaCommonManager.prototype.init = function () {
        try{
            this.saCommonNonce = '';
            this.commonManagerAjaxUrl = '';
            this.dateParams = {}; //params for date filter
            this.defaultRoute = "dashboard";
            this.notification = {} // object for handling all notification messages
            this.notificationHideDelayInMs = 16000
            this.modal = {} // object for handling all modal dialogs
            this.selectAll = false;
            this.selectedIds = [];
            this.selectedRows = [];
            this.saManagerStoreModel = new Array()
            this.currentColModel = '';
            this.hideDialog = '';
            this.bulkEditRoute = "bulkEdit";
            // Loading messages configuration
            this.dashboardLoadingMessages = [
                _x("Brewing something good for you ☕", "loading message", "smart-manager-for-wp-e-commerce"),
                _x("Hang tight, we are getting things ready ⏳", "loading message", "smart-manager-for-wp-e-commerce"),
                _x("Putting everything in its right place 🧩", "loading message", "smart-manager-for-wp-e-commerce"),
                _x("Just a moment, making things neat ⚙️", "loading message", "smart-manager-for-wp-e-commerce"),
                _x("Good things are coming together ✨", "loading message", "smart-manager-for-wp-e-commerce"),
                _x("Almost there, adding the final touches 🎯", "loading message", "smart-manager-for-wp-e-commerce"),
                _x("Sit tight, magic in progress 🪄", "loading message", "smart-manager-for-wp-e-commerce"),
                _x("Getting everything lined up just right 📐", "loading message", "smart-manager-for-wp-e-commerce"),
                _x("Warming things up behind the scenes 🔥", "loading message", "smart-manager-for-wp-e-commerce"),
                _x("Making things look effortless 🙂", "loading message", "smart-manager-for-wp-e-commerce"),
                _x("All set in a moment, promise 🤝", "loading message", "smart-manager-for-wp-e-commerce"),
                _x("Keeping things sharp and ready ⚡", "loading message", "smart-manager-for-wp-e-commerce"),
                _x("Bringing it all together…", "loading message", "smart-manager-for-wp-e-commerce"),
            ];
            // Loading message state
            this.loadingMessageTimer = null;
            // defining operators for diff datatype for advanced search
            let intOperators = {
                'eq': _x('Equal to ==', "select options - operator for 'numeric' data type fields", 'smart-manager-for-wp-e-commerce'),
                'neq': _x('Not equal to !=', "select options - operator for 'numeric' data type fields", 'smart-manager-for-wp-e-commerce'),
                'lt': _x('Less than <', "select options - operator for 'numeric' data type fields", 'smart-manager-for-wp-e-commerce'),
                'gt': _x('Greater than >', "select options - operator for 'numeric' data type fields", 'smart-manager-for-wp-e-commerce'),
                'lte': _x('Less than or equal to <=', "select options - operator for 'numeric' data type fields", 'smart-manager-for-wp-e-commerce'),
                'gte': _x('Greater than or equal to >=', "select options - operator for 'numeric' data type fields", 'smart-manager-for-wp-e-commerce')
            };
            this.possibleOperators = {
                'numeric': intOperators,
                'date': intOperators,
                'datetime': intOperators,
                'date': intOperators,
                'dropdown': {
                    'is': _x('is', "select options - operator for 'dropdown' data type fields", 'smart-manager-for-wp-e-commerce'),
                    'is not': _x('is not', "select options - operator for 'dropdown' data type fields", 'smart-manager-for-wp-e-commerce')
                },
                'text': {
                    'is': _x('is', "select options - operator for 'text' data type fields", 'smart-manager-for-wp-e-commerce'),
                    'like': _x('contains', "select options - operator for 'text' data type fields", 'smart-manager-for-wp-e-commerce'),
                    'is not': _x('is not', "select options - operator for 'text' data type fields", 'smart-manager-for-wp-e-commerce'),
                    'not like': _x('not contains', "select options - operator for 'text' data type fields", 'smart-manager-for-wp-e-commerce')
                }
            }
            this.ajaxParams = {}
            this.dashboardKey = ''
            this.columnNamesBatchUpdate= new Array()
            this.pluginSlug = '';
            this.savedBulkEditConditions = [];
            this.date_params = {}; //params for date filter
            let additionalDateOperators = { increase_date_by: _x('increase by', "bulk edit action - 'date' fields", 'smart-manager-for-wp-e-commerce'), decrease_date_by: _x('decrease by', "bulk edit action - 'date' fields", 'smart-manager-for-wp-e-commerce') };
            this.batchUpdateActions = {
                'numeric': { increase_by_per: _x('increase by %', "bulk edit action - 'number' fields", 'smart-manager-for-wp-e-commerce'), decrease_by_per: _x('decrease by %', "bulk edit action - 'number' fields", 'smart-manager-for-wp-e-commerce'), increase_by_num: _x('increase by number', "bulk edit action - 'number' fields", 'smart-manager-for-wp-e-commerce'), decrease_by_num: _x('decrease by number', "bulk edit action - 'number' fields", 'smart-manager-for-wp-e-commerce') },
                'image': {},
                'multipleImage': {},
                'datetime': Object.assign({ set_datetime_to: _x('set datetime to', "bulk edit action - 'datetime' fields", 'smart-manager-for-wp-e-commerce'), set_date_to: _x('set date to', "bulk edit action - 'datetime' fields", 'smart-manager-for-wp-e-commerce'), set_time_to: _x('set time to', "bulk edit action - 'datetime' fields", 'smart-manager-for-wp-e-commerce') }, additionalDateOperators),
                'date': Object.assign({ set_date_to: _x('set date to', "bulk edit action - 'date' fields", 'smart-manager-for-wp-e-commerce') }, additionalDateOperators),
                'time': Object.assign({ set_time_to: _x('set time to', "bulk edit action - 'time' fields", 'smart-manager-for-wp-e-commerce') }, additionalDateOperators),
                'dropdown': {},
                'multilist': { add_to: _x('add to', "bulk edit action - 'multiselect list' fields", 'smart-manager-for-wp-e-commerce'), remove_from: _x('remove from', "bulk edit action - 'multiselect list' fields", 'smart-manager-for-wp-e-commerce') },
                'serialized': {},
                'text': { prepend: _x('prepend', "bulk edit action - 'text' fields", 'smart-manager-for-wp-e-commerce'), append: _x('append', "bulk edit action - 'text' fields", 'smart-manager-for-wp-e-commerce'), search_and_replace: _x('search & replace', "bulk edit action - 'text' fields", 'smart-manager-for-wp-e-commerce') }
            }
            let types_exclude_set_to = ['datetime', 'date', 'time']
            Object.keys(this.batchUpdateActions).forEach(key => {
                let setToObj = (types_exclude_set_to.includes(key)) ? {} : { set_to: _x('set to', 'bulk edit action', 'smart-manager-for-wp-e-commerce') }
                this.batchUpdateActions[key] = Object.assign(setToObj, this.batchUpdateActions[key], { copy_from: _x('copy from', 'bulk edit action', 'smart-manager-for-wp-e-commerce') }, { copy_from_field: _x('copy from field', 'bulk edit action', 'smart-manager-for-wp-e-commerce') });
            });
        } catch (e){
            SaErrorHandler.log('Error initializing SaCommonManager:: ', e)
        }
    };

    SaCommonManager.prototype.getDashboardModel = function (sendRequest = true) {
        try{
            var self = this;
            this.currentDashboardModel = '';
            // Hide grid and start loading message timer (show after 3 seconds)
            jQuery('#sm_editor_grid').css('visibility', 'hidden');
            self.loadingMessageTimer = setTimeout(function() {
                self.showDashboardLoadingMessage();
            }, 3000);

           // Ajax request params to get the dashboard model.
            this.ajaxParams = {
                data_type: 'json',
                data: {
                    cmd: 'get_dashboard_model',
                    security: this.saCommonNonce,
                    active_module: this.dashboardKey,
                    lang: this?.lang || ''
                }
            }
            if(sendRequest){
                this.sendRequest(this.ajaxParams, this.setDashboardModel)
            }
            //sendrequest for ABE
        } catch (e){
          SaErrorHandler.log('Error in getDashboardModel:: ', e)
        }
    }

    SaCommonManager.prototype.setDashboardModel = function (response) {
        try{
            // Hide loading messages and restore grid visibility
            SaCommonManager.prototype.hideDashboardLoadingMessage.call(window[pluginKey] || this);

            if (typeof response == 'undefined' || response == '') {
                return;
            }
            jQuery('.sm_grid_notice').remove();
            if (response?.dashboard_notice_message?.length > 0) {
                jQuery('<div class="ml-5 sm_grid_notice notice notice-warning is-dismissible" style="display:block !important;"><p>' + response.dashboard_notice_message + '</p></div>').insertBefore('#sm-header');
            }
            this.currentColModel = response.columns;
            //call to function for formatting the column model
            if (typeof (this.formatDashboardColumnModel) !== "undefined" && typeof (this.formatDashboardColumnModel) === "function") {
                this.formatDashboardColumnModel();
            }
            response.columns = this.currentColModel;
            this.currentDashboardModel = response
            if (this.firstLoad) {
                this.firstLoad = false
            }
            if (typeof this.childSetDashboardModel === 'function') {
                this.childSetDashboardModel(response);
            }
            if(typeof this.setSearchableCols === 'function'){
                this.setSearchableCols();
            }
            if(1===parseInt(window.smart_manager.sm_beta_pro)){
                let showEditHistory = window.location.search.includes('show_edit_history');
                //Show tasks list based on url params.
                if(showEditHistory){
                    jQuery("#sm_show_tasks").prop('checked', true);
                    jQuery('#sm_editor_grid').trigger('sm_show_tasks_change');
                }
                //Apply advanced search to dashboards based on url params.
                if( typeof window[pluginKey].buildSearchParamsFromUrl === 'function'){
                    let advancedSearchParamsFromUrl = window[pluginKey].buildSearchParamsFromUrl( window.location.href, showEditHistory );
                    if(advancedSearchParamsFromUrl && typeof (window[pluginKey].applyAdvancedSearch) === "function"){
                        window[pluginKey].applyAdvancedSearch(advancedSearchParamsFromUrl)
                    }else if(showEditHistory){
                        window.smart_manager.refresh();
                    }
                    //Remove url params except page.
                    if(typeof (window.smart_manager.removeURLParams)==='function' ){
                        window.smart_manager.removeURLParams?.([...new URLSearchParams(location.search).keys()].filter(k => k !== 'page'));
                    }
                }
            }
        } catch (e){
            SaErrorHandler.log('Error in setDashboardModel:: ', e)
        }
    }

    SaCommonManager.prototype.setSearchableCols = function () {
        if (typeof (window[pluginKey].currentColModel) == 'undefined') {
            return;
        }

        let colModel = JSON.parse(JSON.stringify(window[pluginKey].currentColModel));
        window[pluginKey].colModelSearch = {}

        Object.entries(colModel).map(([key, obj]) => {
            if (obj.hasOwnProperty('searchable') && obj.searchable == 1) {

                if (obj.type == 'checkbox') {
                    obj.type = 'dropdown';
                    obj.search_values = window[pluginKey].getCheckboxValues(obj);
                }

                if (obj.type == 'sm.multilist') {
                    obj.type = 'dropdown';
                }

                if (obj.type == 'text') {
                    if (obj.hasOwnProperty('validator')) {
                        if (obj.validator == 'customNumericTextEditor') {
                            obj.type = 'numeric';
                        }
                    }
                }

                if (obj.type == "number") {
                    obj.type = 'numeric'
                }

                window[pluginKey].colModelSearch[obj.table_name + '.' + obj.col_name] = {
                    'title': obj.name_display,
                    'type': (obj.hasOwnProperty('search_type')) ? obj.search_type : obj.type,
                    'values': (obj.search_values) ? obj.search_values : {}
                }

            }
        });
        if (window[pluginKey].hasOwnProperty('colModelSearch') && Object.entries(window[pluginKey].colModelSearch).length > 0) {
            window[pluginKey].advancedSearchFields = Object.entries(window[pluginKey].colModelSearch).map(([key, value]) => ({
                id: key,
                text: value.title || key
            }))
        }
        if (window[pluginKey].hasOwnProperty('columnNamesBatchUpdate') && Object.entries(window[pluginKey].columnNamesBatchUpdate).length > 0) {
            window[pluginKey].bulkEditFields = Object.entries(window[pluginKey].columnNamesBatchUpdate).map(([key, value]) => ({
                id: key,
                text: value.title || key
            }))
        }
    }
    //function to format the column model
    SaCommonManager.prototype.formatDashboardColumnModel = function (column_model) {
        try{
            if (this.currentColModel == '' || typeof (this.currentColModel) == 'undefined') {
                return;
            }
            index = 0;
            this.column_names = [];
            this.currentVisibleColumns = [];
            this.columnNamesBatchUpdate= [];
            for (i = 0; i < this.currentColModel.length; i++) {
                if (typeof (this.currentColModel[i]) == 'undefined') {
                    continue;
                }
                hidden = (typeof (this.currentColModel[i].hidden) != 'undefined') ? this.currentColModel[i].hidden : true;
                column_values = (typeof (this.currentColModel[i].values) != 'undefined') ? this.currentColModel[i].values : {};
                type = (typeof (this.currentColModel[i].type) != 'undefined') ? this.currentColModel[i].type : '';
                editor = (typeof (this.currentColModel[i].editor) != 'undefined') ? this.currentColModel[i].editor : '';
                selectOptions = (typeof (this.currentColModel[i].selectOptions) != 'undefined') ? this.currentColModel[i].selectOptions : '';
                multiSelectSeparator = (typeof (this.currentColModel[i].separator) != 'undefined') ? this.currentColModel[i].separator : '';
                allowMultiSelect = false;
                if (type == 'dropdown' && editor == 'select2') {
                    if (this.currentColModel[i].hasOwnProperty('select2Options')) {
                        if (this.currentColModel[i].select2Options.hasOwnProperty('data')) {
                            column_values = {};
                            allowMultiSelect = (this.currentColModel[i].select2Options.hasOwnProperty('multiple')) ? this.currentColModel[i].select2Options.multiple : false;
                            this.currentColModel[i].select2Options.data.forEach(function (obj) {
                                column_values[obj.id] = obj.text;
                            });
                        }
                    }
                }
                let bu_values = []
                if (Object.keys(column_values).length > 0) {
                    Object.keys(column_values).forEach(key => {
                        bu_values.push({ 'key': key, 'value': column_values[key] })
                    });
                }
                let name = '';
                if (typeof (this.currentColModel[i].name) != 'undefined') {
                    name = (this.currentColModel[i].name) ? this.currentColModel[i].name.trim() : '';
                }
                if (this.currentColModel[i].hasOwnProperty('name_display') === false) {// added for state management
                    this.currentColModel[i].name_display = name;
                }
                if (hidden === false) {
                    this.column_names[index] = this.currentColModel[i].name_display; //Array for column headers
                    this.currentVisibleColumns[index] = this.currentColModel[i];
                    index++;
                }
                var batch_enabled_flag = false;
                if (this.currentColModel[i].hasOwnProperty('batch_editable')) {
                    batch_enabled_flag = this.currentColModel[i].batch_editable;
                }
                if (batch_enabled_flag === true) {
                    let type = this.currentColModel[i].type;
                    if (this.currentColModel[i].hasOwnProperty('validator')) {
                        if ('customNumericTextEditor' == this.currentColModel[i].validator) {
                            type = 'numeric';
                        }
                    }
                    this.columnNamesBatchUpdate[this.currentColModel[i].src] = { title: this.currentColModel[i].name_display, type: type, editor: this.currentColModel[i].editor, values: bu_values, src: this.currentColModel[i].data, allowMultiSelect: allowMultiSelect, multiSelectSeparator: multiSelectSeparator };
                    if (this.currentColModel[i].type == 'checkbox') {
                        this.columnNamesBatchUpdate[this.currentColModel[i].src].type = 'dropdown';
                        this.columnNamesBatchUpdate[this.currentColModel[i].src].values = this.getCheckboxValues(this.currentColModel[i]);
                    }
                    if (this.currentColModel[i].type == (this.pluginSlug + '.multilist')) {
                        this.columnNamesBatchUpdate[this.currentColModel[i].src].type = 'multilist';
                        //Code for setting the values
                        let multilistValues = this.columnNamesBatchUpdate[this.currentColModel[i].src].values
                        let multilistBulkEditValues = []
                        multilistValues.forEach((obj) => {
                            let val = (obj.hasOwnProperty('value')) ? obj.value : {}
                            let title = (val.hasOwnProperty('title')) ? val.title : ((val.hasOwnProperty('term')) ? val.term : '')
                            multilistBulkEditValues.push({ 'key': obj.key, 'value': title });
                        })
                        this.columnNamesBatchUpdate[this.currentColModel[i].src].values = multilistBulkEditValues
                    }
                }
                if (typeof (this.currentColModel[i].allow_showhide) != 'undefined' && this.currentColModel[i].allow_showhide === false) {
                    this.currentColModel[i].hidedlg = true;
                }
                this.currentColModel[i].name = this.currentColModel[i].index;
            }
            if (typeof this.childFormatDashboardColumnModel === 'function') {
                this.childFormatDashboardColumnModel(this.currentColModel);
            }
        } catch (e){
            SaErrorHandler.log('Error in formatDashboardColumnModel:: ', e)
        }
    }

    SaCommonManager.prototype.sendRequest = function(params, callback, callbackParams) {
        try{
            jQuery.ajax({
                type: ((typeof (params.call_type) != 'undefined') ? params.call_type : 'POST'),
                url: ((typeof (params.call_url) != 'undefined') ? params.call_url : this.commonManagerAjaxUrl),
                dataType: ((typeof (params.data_type) != 'undefined') ? params.data_type : 'text'),
                async: ((typeof (params.async) != 'undefined') ? params.async : true),
                data: params.data,
                success: function (resp) {
                    if (typeof params.showLoader == 'undefined' || (typeof params.showLoader != 'undefined' && params.showLoader !== false)) {
                        if (false == params.hasOwnProperty('hideLoader') || (params.hasOwnProperty('hideLoader') && false != params.hideLoader)) {
                            SaCommonManager.prototype.showLoader(false);
                        }
                    }
                    return ((typeof (callbackParams) != 'undefined') ? callback(callbackParams, resp) : callback(resp));
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    SaCommonManager.prototype.showLoader(false);
                    console.log('AJAX failed::', jqXHR, textStatus, errorThrown);
                    let message = jqXHR.responseJSON?.data?.message;
                    if (!message && jqXHR.responseText) {
                        try {
                            message = JSON.parse(jqXHR.responseText)?.data?.message;
                        } catch (e) {}
                    }
                    let errorResponse = {
                        error: true,
                        status: jqXHR.status,
                        message: message || errorThrown || textStatus
                    };
                    return ((typeof (callbackParams) != 'undefined') ? callback(callbackParams, errorResponse) : callback(errorResponse));
                }
            });
        }catch(e){
            SaErrorHandler.log('In sending AJAX request:: ', e)
        }

    }

    SaCommonManager.prototype.showLoader = function (is_show = true) {
        try {
            if (is_show) {
                jQuery('.sa-loader-container').hide().show();
            } else {
                jQuery('.sa-loader-container').hide();
            }
        } catch (e) {
            SaErrorHandler.log('Error in showLoader:: ', e)
        }
    }

    //Function to show confirm dialog
    SaCommonManager.prototype.showConfirmDialog = function (params) {
        this.modal = {
            title: (params.hasOwnProperty('title') !== false && params.title != '') ? params.title : _x('Warning', 'modal title', 'smart-manager-for-wp-e-commerce'),
            content: (params.hasOwnProperty('content') !== false && params.content != '') ? params.content : _x('Are you sure?', 'modal content', 'smart-manager-for-wp-e-commerce'),
            autoHide: false,
            showCloseIcon: (params.hasOwnProperty('showCloseIcon')) ? params.showCloseIcon : true,
            cta: {
                title: ((params.btnParams.hasOwnProperty('yesText')) ? params.btnParams.yesText : _x('Yes', 'button', 'smart-manager-for-wp-e-commerce')),
                closeModalOnClick: (params.btnParams.hasOwnProperty('hideOnYes')) ? params.btnParams.hideOnYes : true,
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
                callback: function () {
                    if (params.btnParams.hasOwnProperty('noCallback') && typeof params.btnParams.noCallback === "function") {
                        params.btnParams.noCallback();
                    }
                }
            },
            route: params?.route || false
        }
        this.showModal()
    }

    // Function to handle all modal dialog
    SaCommonManager.prototype.showModal = function(){
        try {
            if(this.modal.hasOwnProperty('title') && '' !== this.modal.title && this.modal.hasOwnProperty('content') && '' !== this.modal.content && (typeof (this.showPannelDialog) !== "undefined" && typeof (this.showPannelDialog) === "function" && typeof (this.getDefaultRoute) !== "undefined" && typeof (this.getDefaultRoute) === "function")){
                let test = '';
                test = (this.modal?.route || this.getDefaultRoute());
                this.showPannelDialog(this.modal?.route || this.getDefaultRoute())
            }
        } catch (e) {
            SaErrorHandler.log('Exception occurred in showModal:: ', e)
        }
    }

    // Function for hiding modal
	SaCommonManager.prototype.hideModal = function() {
		setTimeout(() => {
			try{
				this.modal = {}
				if(typeof (this.showPannelDialog) !== "undefined" && typeof (this.showPannelDialog) === "function" && typeof (this.getDefaultRoute) !== "undefined" && typeof (this.getDefaultRoute) === "function"){
					this.showPannelDialog('',this.getDefaultRoute(true))
				}
			} catch(e){
				SaErrorHandler.log('Exception occurred in hideModal:: ', e)
			}
		},200)
	}

    // Function to show the pannel dialog
    SaCommonManager.prototype.showPannelDialog = function(route = '', currentRoute = '') {
        try{
            if(!route && !currentRoute){
                return
            }
            let routeIdentifier = "#!/"
            let currentURL = (window.location.href.indexOf(routeIdentifier) >= 0) ? window.location.href.substring(0, window.location.href.indexOf(routeIdentifier)) : window.location.href
            if(!currentURL){
                return
            }
            let defaultRoute = routeIdentifier+this.defaultRoute
            route = (!route) ? ((routeIdentifier === currentRoute) ? defaultRoute : routeIdentifier) : ((routeIdentifier === route) ? route : routeIdentifier+route)
            window.location.href = currentURL + route
        } catch (e){
            SaErrorHandler.log('Exception occurred in showPannelDialog:: ', e)
        }
    }

    // Function to get default route
    SaCommonManager.prototype.getDefaultRoute = function(isReplaceRoute = false){
        try{
            return (isReplaceRoute) ?
             ((window.location.href.includes(this.defaultRoute) ) ? '/'+this.defaultRoute : '#!/')
             : ((window.location.href.includes(this.defaultRoute) ) ? '#!/' : this.defaultRoute)
        } catch (e){
            SaErrorHandler.log('Exception occurred in getDefaultRoute:: ', e)
        }
    }

    SaCommonManager.prototype.getCheckboxValues = function( colObj ) {
        try{
            if(!colObj){
                return [];
            }
            if( !(colObj.hasOwnProperty('checkedTemplate') && colObj.hasOwnProperty('uncheckedTemplate')) ) {
                colObj.checkedTemplate = 'true';
                colObj.uncheckedTemplate = 'false';
            }
            return new Array({'key': colObj.checkedTemplate, 'value':  String(colObj.checkedTemplate).capitalize()},
                            {'key': colObj.uncheckedTemplate, 'value':  String(colObj.uncheckedTemplate).capitalize()});
        } catch (e){
            SaErrorHandler.log('Exception occurred in getCheckboxValues:: ', e)
        }
    }

    //Function to show progress dialog
    SaCommonManager.prototype.showProgressDialog = function (title = '') {
        try {
            this.modal = {
                title: (title != '') ? title : _x('Please Wait', 'progressbar modal title', 'smart-manager-for-wp-e-commerce'),
                content: '<div class="flex flex-col items-center justify-center py-4 px-4">' +
                    '<div class="sa_background_update_progressbar w-full bg-sm-base-muted rounded-full h-2.5 mb-4 overflow-hidden">' +
                        '<div class="sa_background_update_progressbar_fill bg-sm-base-primary h-full rounded-full transition-all duration-300 ease-out" style="width: 0%"></div>' +
                    '</div>' +
                    '<span class="sa_background_update_progressbar_text text-center text-lg font-semibold text-sm-base-foreground mb-2">' + _x('Initializing...', 'progressbar modal content', 'smart-manager-for-wp-e-commerce') + '</span>' +
                '</div>' +
                '<div class="flex justify-end px-4 pb-4">' +
                    '<a href="javascript:void(0);" class="sa_' + this.pluginSlug + '_batch_update_background_link text-sm font-medium text-sm-base-primary hover:underline cursor-pointer transition-colors duration-200">' + _x('Continue in background', 'progressbar modal content', 'smart-manager-for-wp-e-commerce') + '</a>' +
                '</div>',
                autoHide: false,
                showCloseIcon: false,
                hideFooter: true,
                cta: {}
            }
            this.showModal()
        } catch (e) {
            SaErrorHandler.log('Exception occurred in showProgressDialog:: ', e)
        }
    }

    SaCommonManager.prototype.reset = function (fullReset = false) {
        try {
            if (fullReset) {
                this.column_names = [];
                this.savedBulkEditConditions = []
            }
            this.currentDashboardData = [];
            this.selectAll = false;
            this.scheduledActionContent = '';
            this.isScheduled = false;
            this.ajaxParams = {};
        } catch (e) {
            SaErrorHandler.log('Exception occurred in reset:: ', e)
        }
    }

    SaCommonManager.prototype.refresh = function( dataParams ) {
        try{
            this.reset();
        } catch (e){
            SaErrorHandler.log('Exception occurred in refresh:: ', e)
        }
    }

    String.prototype.capitalize = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }

    // Display title modal with schedule toggle
    SaCommonManager.prototype.showTitleModal = function (params = {}) {
        if (!window[pluginKey].processName || !window[pluginKey].processContent) {
            return;
        }

        let isUndoEnabled = window[pluginKey].isUndoFeatureEnabled === true;
        let showScheduleOption = params.showScheduleOption === true;

        let title = sprintf(
            /* translators: %s: Task process content */
            _x('Edited %s', 'process title', 'smart-manager-for-wp-e-commerce'), window[pluginKey].processContent)
        
        // Modal title and description based on undo feature
        let modalTitle = isUndoEnabled 
            ? _x('Task Title', 'modal title', 'smart-manager-for-wp-e-commerce')
            : _x('Bulk Edit', 'modal title', 'smart-manager-for-wp-e-commerce');
        
        let taskContent = isUndoEnabled 
            ? '<input type="text" id="sm_add_title" placeholder="' + _x('Enter desired title here...', 'title placeholder', 'smart-manager-for-wp-e-commerce') + '" value="' + title + '" style="flex: 1; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.875rem;">'
            : '<input type="hidden" id="sm_add_title" value="' + title + '">';
        
        let taskDesc = isUndoEnabled
            ? sprintf(
                /* translators: %s: Undo modal description */
                _x('Name the task for easier reference and future actions, especially for %s option. A pre-filled title has been suggested based on your changes.', 'modal description', 'smart-manager-for-wp-e-commerce'), '<strong class="text-sm-base-foreground">' + _x('Undo', 'modal description', 'smart-manager-for-wp-e-commerce') + '</strong>')
            : _x('Your bulk edit is ready to be applied. Click "Apply Changes" to run it immediately, or toggle the schedule option below to run it at a specific date and time.', 'modal description', 'smart-manager-for-wp-e-commerce');

        // Schedule toggle with inline styles for compatibility - only show for bulk edit
        let scheduleToggle = showScheduleOption ? `
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-top: 1rem; margin-bottom: 0.5rem;">
                <label style="position: relative; display: inline-flex; align-items: center; cursor: pointer;">
                    <input type="checkbox" id="sm_schedule_toggle" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border-width: 0;">
                    <div id="sm_schedule_toggle_track" style="width: 2.25rem; height: 1.25rem; background-color: #e5e7eb; border-radius: 9999px; position: relative; transition: background-color 0.2s ease;">
                        <div id="sm_schedule_toggle_knob" style="position: absolute; top: 2px; left: 2px; width: 1rem; height: 1rem; background-color: white; border-radius: 9999px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: transform 0.2s ease;"></div>
                    </div>
                </label>
                <span style="font-size: 0.875rem; font-weight: 500; color: #374151;">${_x('Schedule this bulk edit', 'schedule toggle label', 'smart-manager-for-wp-e-commerce')}</span>
            </div>
        ` : '';

        let scheduledForContent = showScheduleOption ? `
            <div id="sm_schedule_fields" style="display: none; margin-top: 0.75rem; padding: 0.75rem; background-color: #f9fafb; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
                <div style="display: flex; align-items: center; margin-bottom: 0.75rem;">
                    <label style="font-size: 0.875rem; font-weight: 500; color: #374151; margin-right: 0.75rem; white-space: nowrap;">${_x('Schedule For', 'modal title', 'smart-manager-for-wp-e-commerce')}</label>
                    <input type="text" id="scheduled_for" placeholder="YYYY-MM-DD HH:MM:SS" style="flex: 1; border: 1px solid #d1d5db; border-radius: 0.375rem; font-size: 0.85rem;"/>
                </div>
                ${window[pluginKey].scheduledActionAdminUrl
                    ? `<div style="margin-bottom: 0.5rem; font-size: 0.875rem; color: #4b5563;">
                        ${_x(`Check all scheduled actions <a target='_blank' href='${window[pluginKey].scheduledActionAdminUrl}' style='color: #6366f1; text-decoration: none;'>here</a>.`, 'scheduled action list', 'smart-manager-for-wp-e-commerce')}
                    </div>`
                    : ''}
                <div style="font-size: 0.75rem; color: #6b7280; font-style: italic;">
                    <strong class="text-sm-base-foreground">${_x('Note: ', 'modal description', 'smart-manager-for-wp-e-commerce')}</strong>${_x('Scheduled actions follow timezone of your site. Avoid overlaps to prevent delays.', 'modal description', 'smart-manager-for-wp-e-commerce')}
                </div>
            </div>
        ` : '';

        if (0 === window[pluginKey].showTasksTitleModal) {
            window[pluginKey].updatedTitle = title
            if ("function" === typeof (window[pluginKey].processCallback)) {
                ("undefined" !== typeof (window[pluginKey].processCallbackParams) && Object.keys(window[pluginKey].processCallbackParams).length > 0) ? window[pluginKey].processCallback(window[pluginKey].processCallbackParams) : window[pluginKey].processCallback()
            }
            return;
        }

        // Build unified content with schedule toggle
        let titleFieldSection = isUndoEnabled 
            ? `<div style="display: flex; align-items: center; margin-bottom: 0.75rem;">
                    <label for="sm_add_title" style="font-size: 0.875rem; font-weight: 500; color: #374151; margin-right: 0.75rem;">${_x('Title', 'modal title', 'smart-manager-for-wp-e-commerce')}</label>
                    ${taskContent}
                </div>`
            : taskContent;

        content = `
            <div id="show_modal_content">
                <div style="padding-bottom: 1em; color: #6b7280!important;">${taskDesc}</div>
                ${titleFieldSection}
                ${scheduleToggle}
                ${scheduledForContent}
            </div>
        `;

        // CTA button text based on undo feature
        let ctaTitle = isUndoEnabled 
            ? _x('Ok', 'button', 'smart-manager-for-wp-e-commerce')
            : _x('Apply Changes', 'button', 'smart-manager-for-wp-e-commerce');
        
        let closeCTATitle = isUndoEnabled
            ? _x('Cancel', 'button', 'smart-manager-for-wp-e-commerce')
            : _x('Cancel', 'button', 'smart-manager-for-wp-e-commerce');

        window[pluginKey].modal = {
            title: modalTitle,
            content: content,
            autoHide: false,
            cta: {
                title: ctaTitle,
                closeModalOnClick: params.hasOwnProperty('btnParams') ? ((params.btnParams.hasOwnProperty('hideOnYes')) ? params.btnParams.hideOnYes : true) : true,
                callback: function () {
                    // Check if scheduling is enabled via toggle
                    let isScheduleEnabled = jQuery('#sm_schedule_toggle').is(':checked');
                    window[pluginKey].isScheduled = isScheduleEnabled;

                    if (isScheduleEnabled) {
                        if ("undefined" !== typeof (window[pluginKey].scheduledForVal) && "function" === typeof (window[pluginKey].scheduledForVal)) {
                            window[pluginKey].scheduledForVal();
                        }
                        if (!(window[pluginKey].scheduledFor)) {
                            window[pluginKey].notification = { message: _x('Please select your desired date & time for scheduling an action.', 'notification', 'smart-manager-for-wp-e-commerce') }
                            window[pluginKey].showNotification()
                            return;
                        }
                        if ("undefined" !== typeof (window[pluginKey].hideModal) && "function" === typeof (window[pluginKey].hideModal)) {
                            window[pluginKey].hideModal();
                        }
                    }
                    let updatedTitle = jQuery('#sm_add_title').val();
                    if (updatedTitle) {
                        window[pluginKey].updatedTitle = updatedTitle;
                        if ("function" === typeof (window[pluginKey].processCallback)) {
                            ("undefined" !== typeof (window[pluginKey].processCallbackParams) && Object.keys(window[pluginKey].processCallbackParams).length > 0) ? window[pluginKey].processCallback(window[pluginKey].processCallbackParams) : window[pluginKey].processCallback()
                        }
                    }
                }
            },
            closeCTA: { title: closeCTATitle },
            onCreate: function () {
                // Initialize datepicker
                if ("undefined" !== typeof (window[pluginKey].scheduleDatePicker) && "function" === typeof (window[pluginKey].scheduleDatePicker)) {
                    window[pluginKey].scheduleDatePicker('#scheduled_for');
                }
                // Handle schedule toggle click
                jQuery('#sm_schedule_toggle_track').on('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    let $track = jQuery(this);
                    let $knob = jQuery('#sm_schedule_toggle_knob');
                    let $checkbox = jQuery('#sm_schedule_toggle');
                    let isChecked = !$checkbox.is(':checked');
                    
                    $checkbox.prop('checked', isChecked);
                    $track.css('background-color', isChecked ? '#6366f1' : '#e5e7eb');
                    $knob.css('transform', isChecked ? 'translateX(1rem)' : 'translateX(0)');
                    jQuery('#sm_schedule_fields')[isChecked ? 'slideDown' : 'slideUp'](200);
                    
                    if (!isChecked) {
                        window[pluginKey].scheduledFor = '';
                    }
                });
            }
        }
        window[pluginKey].showModal()
    }

    // Get random message (different from current)
    SaCommonManager.prototype.getRandomLoadingMessage = function() {
        var self = this;
        var newIndex;
        do {
            newIndex = Math.floor(Math.random() * self.dashboardLoadingMessages.length);
        } while (newIndex === (window[pluginKey]?.dashboardLoadingOverlay?.currentMessageIndex ?? -1) && self.dashboardLoadingMessages.length > 1);
        return { index: newIndex, message: self.dashboardLoadingMessages[newIndex] };
    };

    // Show loading message overlay (renders HTML directly)
    SaCommonManager.prototype.showDashboardLoadingMessage = function() {
        var self = this;
        var randomMsg = self.getRandomLoadingMessage();
        
        // Set state on window[pluginKey]
        window[pluginKey].dashboardLoadingOverlay = {
            isVisible: true,
            currentMessageIndex: randomMsg.index,
            currentMessage: randomMsg.message
        };
        
        // Render overlay HTML directly
        var $container = jQuery('#sm-loading-messages-root');
        if ($container.length) {
            $container.html(
                '<div class="fixed inset-0 flex items-center justify-center transition-opacity duration-300 bottom-[5%] left-[6%]" style="z-index: 99; pointer-events: none;">' +
                    '<div class="p-8 max-w-lg mx-4 text-center transform transition-all duration-500 animate-fadeIn" style="pointer-events: auto;">' +
                        '<p class="text-lg font-medium text-gray-700">' + randomMsg.message + '</p>' +
                    '</div>' +
                '</div>'
            );
        }
    };

    // Hide loading message overlay
    SaCommonManager.prototype.hideDashboardLoadingMessage = function() {
        var self = this;
        // Clear timers
        if (self.loadingMessageTimer) {
            clearTimeout(self.loadingMessageTimer);
            self.loadingMessageTimer = null;
        }
        // Clear state
        window[pluginKey].dashboardLoadingOverlay = {
            isVisible: false,
            currentMessageIndex: -1,
            currentMessage: null
        };
        
        // Clear overlay HTML
        jQuery('#sm-loading-messages-root').empty();
        
        // Restore grid visibility and remove blur
        jQuery('#sm_editor_grid').css('visibility', 'visible');
    };

    window.SaCommonManager = SaCommonManager;
})(window);
