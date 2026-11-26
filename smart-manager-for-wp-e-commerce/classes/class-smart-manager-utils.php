<?php
/**
 * Get product metadata keys that affect WooCommerce's product lookup table.
 *
 * @return array
 */
function sm_get_product_lookup_table_meta_keys() {
	$meta_keys = array(
		'_sku',
		'_virtual',
		'_downloadable',
		'_regular_price',
		'_sale_price',
		'_sale_price_dates_from',
		'_sale_price_dates_to',
		'_price',
		'_manage_stock',
		'_stock',
		'_stock_status',
		'_backorders',
		'_wc_rating_count',
		'_wc_average_rating',
		'total_sales',
	);
	if ( ! empty( Smart_Manager::$sm_is_woo40 ) ) {
		$meta_keys = array_merge( $meta_keys, array( '_tax_status', '_tax_class' ) );
	}
	if ( ! empty( Smart_Manager::$sm_is_woo92 ) ) {
		$meta_keys[] = '_global_unique_id';
	}
	return $meta_keys;
}

/**
 * This function will update the WC lookup table introduced in WC 3.6 for the edited product fields in SM
 *
 * Since SM 4.2.3
 * For WC 3.6+
 */
function sm_update_product_lookup_table( $product_ids ) {
	$product_ids = array_values( array_unique( array_filter( array_map( 'absint', (array) $product_ids ) ) ) );
	if ( empty( $product_ids ) ) {
		return;
	}

	global $wpdb;

	$meta_keys = sm_get_product_lookup_table_meta_keys();

	$query = "SELECT post_id, meta_key, meta_value
				FROM {$wpdb->prefix}postmeta
				WHERE meta_key IN ('" . implode( "','", array_map( 'esc_sql', $meta_keys ) ) . "')
				AND post_id IN (" . implode( ',', array_fill( 0, count( $product_ids ), '%d' ) ) . ")
				ORDER BY post_id, meta_id";
	$results = $wpdb->get_results( $wpdb->prepare( $query, $product_ids ), 'ARRAY_A' );
	$product_meta = array();
	foreach ( $results as $result ) {
		$product_id = absint( $result['post_id'] );
		$meta_key   = $result['meta_key'];
		if ( ! isset( $product_meta[ $product_id ] ) ) {
			$product_meta[ $product_id ] = array();
		}
		if ( '_price' === $meta_key ) {
			$product_meta[ $product_id ][ $meta_key ][] = $result['meta_value'];
		} elseif ( ! array_key_exists( $meta_key, $product_meta[ $product_id ] ) ) {
			$product_meta[ $product_id ][ $meta_key ] = $result['meta_value'];
		}
	}

	$lookup_table_columns = array( 'product_id', 'sku' );
	if ( ! empty( Smart_Manager::$sm_is_woo92 ) ) {
		$lookup_table_columns[] = 'global_unique_id';
	}
	$lookup_table_columns = array_merge(
		$lookup_table_columns,
		array( 'virtual', 'downloadable', 'min_price', 'max_price', 'onsale', 'stock_quantity', 'stock_status', 'rating_count', 'average_rating', 'total_sales' )
	);
	if ( ! empty( Smart_Manager::$sm_is_woo40 ) ) {
		$lookup_table_columns = array_merge( $lookup_table_columns, array( 'tax_status', 'tax_class' ) );
	}

	$lookup_rows = array();
	$cache_rows  = array();
	foreach ( $product_meta as $product_id => $meta ) {
		$prices = ( ! empty( $meta['_price'] ) && is_array( $meta['_price'] ) ) ? array_values( array_filter( $meta['_price'], 'strlen' ) ) : array();
		if ( ! empty( $prices ) ) {
			sort( $prices, SORT_NUMERIC );
		}
		$sale_price    = isset( $meta['_sale_price'] ) ? wc_format_decimal( $meta['_sale_price'] ) : '';
		$active_price  = ( ! empty( $prices ) ) ? wc_format_decimal( reset( $prices ) ) : '';
		$rating_count  = ( isset( $meta['_wc_rating_count'] ) ) ? maybe_unserialize( $meta['_wc_rating_count'] ) : array();
		$manage_stock  = isset( $meta['_manage_stock'] ) ? $meta['_manage_stock'] : '';
		$stock         = ( 'yes' === $manage_stock && isset( $meta['_stock'] ) ) ? wc_stock_amount( $meta['_stock'] ) : null;

		$lookup_rows[ $product_id ] = array(
			'product_id'     => absint( $product_id ),
			'sku'            => isset( $meta['_sku'] ) ? (string) $meta['_sku'] : '',
			'virtual'        => ( isset( $meta['_virtual'] ) && 'yes' === $meta['_virtual'] ) ? 1 : 0,
			'downloadable'   => ( isset( $meta['_downloadable'] ) && 'yes' === $meta['_downloadable'] ) ? 1 : 0,
			'min_price'      => ( ! empty( $prices ) ) ? reset( $prices ) : null,
			'max_price'      => ( ! empty( $prices ) ) ? end( $prices ) : null,
			'onsale'         => ( '' !== $sale_price && $sale_price === $active_price ) ? 1 : 0,
			'stock_quantity' => $stock,
			'stock_status'   => isset( $meta['_stock_status'] ) ? (string) $meta['_stock_status'] : '',
			'rating_count'   => is_array( $rating_count ) ? array_sum( array_map( 'intval', $rating_count ) ) : 0,
			'average_rating' => isset( $meta['_wc_average_rating'] ) ? $meta['_wc_average_rating'] : 0,
			'total_sales'    => isset( $meta['total_sales'] ) ? $meta['total_sales'] : 0,
		);
		if ( ! empty( Smart_Manager::$sm_is_woo40 ) ) {
			$lookup_rows[ $product_id ]['tax_status'] = isset( $meta['_tax_status'] ) ? $meta['_tax_status'] : '';
			$lookup_rows[ $product_id ]['tax_class']  = isset( $meta['_tax_class'] ) ? $meta['_tax_class'] : '';
		}
		if ( ! empty( Smart_Manager::$sm_is_woo92 ) ) {
			$lookup_rows[ $product_id ]['global_unique_id'] = isset( $meta['_global_unique_id'] ) ? $meta['_global_unique_id'] : '';
		}
		$cache_rows[ $product_id ] = $lookup_rows[ $product_id ];
	}

	if ( ! empty( $lookup_rows ) ) {
		$placeholders = array();
		$values = array();
		foreach ( $lookup_rows as $lookup_table_row ) {
			$row_placeholders = array();
			foreach ( $lookup_table_columns as $column ) {
				$value = isset( $lookup_table_row[ $column ] ) ? $lookup_table_row[ $column ] : null;
				if ( null === $value ) {
					$row_placeholders[] = 'NULL';
				} else {
					$row_placeholders[] = '%s';
					$values[] = $value;
				}
			}
			$placeholders[] = '(' . implode( ',', $row_placeholders ) . ')';
		}
		$column_names = '`' . implode( '`,`', $lookup_table_columns ) . '`';
		$update_columns = array();
		foreach ( array_slice( $lookup_table_columns, 1 ) as $column ) {
			$update_columns[] = "`{$column}` = VALUES(`{$column}`)";
		}
		$query = "INSERT INTO {$wpdb->prefix}wc_product_meta_lookup ({$column_names}) VALUES " . implode( ',', $placeholders );
		$query .= ' ON DUPLICATE KEY UPDATE ' . implode( ',', $update_columns );
		if ( false === $wpdb->query( $wpdb->prepare( $query, $values ) ) ) {
			$error_message = 'Failed to update WooCommerce product lookup rows: ' . $wpdb->last_error;
			if ( function_exists( 'sa_manager_log' ) ) {
				sa_manager_log( 'error', $error_message );
			} else {
				error_log( $error_message );
			}
			return;
		}
	}

	foreach ( $cache_rows as $update_data ) {
		if ( ! empty( $update_data ) ) {
			$cache_group = 'object_' . $update_data['product_id'];
			$cached_data = wp_cache_get( 'lookup_table', $cache_group );
			if ( is_array( $cached_data ) ) {
				$update_data = array_merge( $cached_data, $update_data );
			}
			wp_cache_set( 'lookup_table', $update_data, $cache_group );
		}
	}
}
//Function to detect whether a string is timestamp or not
function isTimestamp( $string ) {
    try {
        new DateTime('@' . $string);
    } catch(Exception $e) {
        return false;
    }

    if( $string < strtotime('-30 years') || $string > strtotime('+30 years') ) {
       return false;
    }

	return true;
}

//Function to generate the column state using store model
function sa_sm_generate_column_state( $store_model = array() ) {

	$column_model_transient = array( 'columns' => array(), 'sort_params' => array() );

	if( !empty( $store_model['columns'] ) ) {
		foreach( $store_model['columns'] as $key => $col ) {
			if( empty( $col['hidden'] ) && ! empty( $col['save_state'] ) && ! empty( $col['data'] ) ) {
				$column_model_transient['columns'][ $col['data'] ] = array( 'width' => ( !empty( $col['width'] ) ? $col['width'] : '' ),
																			'position' => ( !empty( $col['position'] ) ? $col['position'] : '' ) );
			}
		}
	}

	$column_model_transient['sort_params'] = ( !empty( $store_model['sort_params'] ) ) ? $store_model['sort_params'] : array();
	if ( ! empty( $store_model['search_params'] ) ) {
		$column_model_transient['search_params'] = $store_model['search_params'];
	}
	if( isset( $store_model['treegrid'] ) ) {
		$column_model_transient['treegrid'] = $store_model['treegrid'];
	}

	$column_model_transient = apply_filters( 'sm_generate_column_state', $column_model_transient, $store_model );

	return $column_model_transient;
}

//Function to update recent dashboards
function sa_sm_update_recent_dashboards( $meta_key = 'post_types', $slug = '' ) {
	if( empty( $meta_key ) || empty( $slug ) ) {
		return;
	}

	$recent_dashboards = get_user_meta( get_current_user_id(), 'sa_sm_recent_'.$meta_key, true );
	if( ! empty( $recent_dashboards ) ){
		$index = array_search( $slug, $recent_dashboards );
		if( false !== $index ) {
			array_splice( $recent_dashboards, $index, 1 );
		}
		array_unshift( $recent_dashboards, $slug );
		$recent_dashboards = array_slice( $recent_dashboards, 0, 3 );
	} else {
		$recent_dashboards = array( $slug );
	}

	if( is_array( $recent_dashboards ) ) {
		update_user_meta( get_current_user_id(), 'sa_sm_recent_'.$meta_key, $recent_dashboards );
	}
}

/**
 * Function to edit previous value format for particular column for storing it in task details table
 *
 * @param array $args array has update_column, data_type & prev_val.
 * @return returns the formatted previous value
 */
function sa_sm_format_prev_val( $args = array() ) {
	if ( empty( $args ) || empty( $args['update_column'] ) || empty( $args['col_data_type'] ) ) {
		return $args['prev_val'];
	}
	switch ( $args['col_data_type'] ) {
		case ( ( ( ! empty( $args['col_data_type']['data_cols_serialized'] ) ) && ( in_array( $args['update_column'], $args['col_data_type']['data_cols_serialized'], true ) ) ) ):
		case ( ! empty( $args['col_data_type'] ) && ( 'sm.serialized' === $args['col_data_type'] ) ):
			return maybe_serialize( $args['prev_val'] );
		case ( ( ! empty( $args['col_data_type']['data_cols_multiselect'] ) ) && ( in_array( $args['update_column'], $args['col_data_type']['data_cols_multiselect'], true ) ) && ( is_array( $args['prev_val'] ) ) ):
		case ( ( ! empty( $args['col_data_type']['data_cols_list'] ) ) && ( in_array( $args['update_column'], $args['col_data_type']['data_cols_list'], true ) ) && ( is_array( $args['prev_val'] ) ) ):
		case ( ( 'sm.multilist' === $args['col_data_type'] || 'dropdown' === $args['col_data_type'] ) ):
			return ( is_array( $args['prev_val'] ) ) ? implode( ',', $args['prev_val'] ) : $args['prev_val'];
		case ( ( ! empty( $args['col_data_type']['data_cols_checkbox'] ) && ( ! empty( $args['updated_val'] ) ) && in_array( $args['update_column'], $args['col_data_type']['data_cols_checkbox'], true ) ) || ( 'checkbox' === $args['col_data_type'] ) ):
			if ( in_array( $args['updated_val'], array( 'yes', 'no' ) ) ) {
				return ( 'yes' === $args['updated_val'] ) ? 'no' : 'yes';
			} else if ( in_array( $args['updated_val'], array( 'true', 'false' ) ) ) {
				return ( 'true' === $args['updated_val'] ) ? 'false' : 'true';
			}
		default:
			return $args['prev_val'];
	}
}

/**
 * Format term ids to names.
 *
 * @param  array  $term_ids Term IDs to format.
 * @param  string $taxonomy Taxonomy name.
 * @return string
 */
function sa_sm_format_term_ids( $term_ids = array(), $taxonomy = '' ) {
	$term_ids = wp_parse_id_list( $term_ids );

	if ( ! count( $term_ids ) ) {
		return '';
	}

	$formatted_terms = array();

	if ( is_taxonomy_hierarchical( $taxonomy ) ) {
		foreach ( $term_ids as $term_id ) {
			$formatted_term = array();
			$ancestor_ids   = array_reverse( get_ancestors( $term_id, $taxonomy ) );

			foreach ( $ancestor_ids as $ancestor_id ) {
				$term = get_term( $ancestor_id, $taxonomy );
				if ( $term && ! is_wp_error( $term ) ) {
					$formatted_term[] = $term->name;
				}
			}

			$term = get_term( $term_id, $taxonomy );

			if ( $term && ! is_wp_error( $term ) ) {
				$formatted_term[] = $term->name;
			}

			$formatted_terms[] = implode( ' > ', $formatted_term );
		}
	} else {
		foreach ( $term_ids as $term_id ) {
			$term = get_term( $term_id, $taxonomy );

			if ( $term && ! is_wp_error( $term ) ) {
				$formatted_terms[] = $term->name;
			}
		}
	}

	return implode( ',', $formatted_terms );
}

//Function to compare column position
function sm_position_compare( $a, $b ){
	if ( $a['position'] == $b['position'] )
		return 0;
	if ( $a['position'] < $b['position'] ) {
		return -1;
	}
	return 1;
}


//Function to sort multidimesnional array based on any given key
function sm_multidimensional_array_sort($array, $on, $order=SORT_ASC){

	$sorted_array = array();
	$sortable_array = array();

	if (count($array) > 0) {
		foreach ($array as $key => $value) {
			if (is_array($value)) {
				foreach ($value as $key2 => $value2) {
					if ($key2 == $on) {
						$sortable_array[$key] = $value2;
					}
				}
			} else {
				$sortable_array[$key] = $value;
			}
		}

		switch ($order) {
			case SORT_ASC:
				asort($sortable_array);
				break;
			case SORT_DESC:
				arsort($sortable_array);
				break;
		}

		foreach ($sortable_array as $key => $value) {
			$sorted_array[$key] = $array[$key];
		}
	}

	return $sorted_array;
}

/**
 * Retrieves the common parameters.
 *
 * @return array An associative array containing common parameters for the Smart Manager plugin.
 */
function get_sa_manager_common_params() {
	return array(
		'plugin_file'          => defined('SM_PLUGIN_FILE') ? SM_PLUGIN_FILE : '',
		'plugin_sku'           => defined('SM_SKU') ? SM_SKU : '',
		'plugin_prefix'        => defined('SM_PREFIX') ? SM_PREFIX : '',
		'plugin_name'          => defined('SM_PLUGIN_NAME') ? SM_PLUGIN_NAME : '',
		'plugin_pro_flag'      => (defined('SMPRO') && (true === SMPRO)) ? true : false,
		'plugin_main_class_nm' => 'Smart_Manager',
		'plugin_dir'           => defined('SM_PLUGIN_DIR_PATH') ? SM_PLUGIN_DIR_PATH : '',
		'plugin_obj_key'       => 'smart_manager',
		'folder_flag'          => '/pro'
	);
}

/**
 * Checks if the Stripe payment gateway is active.
 *
 * @return bool True if the Stripe gateway is active, false otherwise.
 */
function sm_is_stripe_gateway_active() {
	if ( ! function_exists( 'WC' ) || ! is_callable( 'WC' ) ) {
		return false;
	}
	$gateways = WC()->payment_gateways->get_available_payment_gateways();
	if ( empty( $gateways ) || ! is_array( $gateways ) ) {
		return false;
	}
	return ( ! empty( $gateways['stripe'] ) ) ? true : false;
}

/**
 * Updates a Smart Manager task based on provided parameters
 *
 * @param array $params . Parameters for updating the task. Default empty array.
 * @return bool Results of the task update operation
 */
function sm_task_update( $params = array() ){
    global $wpdb;
    if ( empty( $params ) || ( ! is_array( $params ) ) ) {
        return;
    }
    if ( ( ! empty( $params['task_id'] ) ) && ( ( ! empty( $params['status'] ) ) || ( ! empty( $params['completed_date'] ) ) ) ) {
        $set_query = '';
        switch ( $params ) {
            case ( ! empty( $params['status'] ) && ( ! isset( $params['completed_date'] ) ) ):
                $set_query = "status = '{$params['status']}'";
                break;
            case ( ! isset( $params['status'] ) && ( ! empty( $params['completed_date'] ) ) ):
                $set_query = "completed_date = '{$params['completed_date']}'";
                break;
            default:
                $set_query = "status = '{$params['status']}', completed_date = '{$params['completed_date']}'";
            }
        if ( empty( $set_query ) ) {
            return;
        }
        return $wpdb->query( "UPDATE {$wpdb->prefix}sm_tasks SET " . $set_query . " WHERE id = " . $params['task_id'] . "" );
    } elseif ( ! empty( $params['title'] ) && ! empty( $params['post_type'] ) && ! empty( $params['type'] ) && ! empty( $params['actions'] ) && ! empty( $params['record_count'] ) ) {
        $wpdb->query(
            $wpdb->prepare(
                "INSERT INTO {$wpdb->prefix}sm_tasks( title, date, completed_date, post_type, author, type, status, actions, record_count)
                VALUES( %s, %s, %s, %s, %d, %s, %s, %s, %d )",
                $params['title'],
                ( ! empty( $params['created_date'] ) ) ? $params['created_date'] : '0000-00-00 00:00:00',
                '0000-00-00 00:00:00',
                $params['post_type'],
                get_current_user_id(),
                $params['type'],
                ( ! empty( $params['status'] ) ) ? $params['status'] : 'in-progress',
                json_encode( $params['actions'] ),
                $params['record_count']
            )
        );
    }
    return ( ! is_wp_error( $wpdb->insert_id ) ) ? $wpdb->insert_id : 0;
}

/**
 * Updates task details in the database and marks tasks as completed
 *
 * @param array $params Array of parameters containing task details to update
 * @return void
 */
function sm_task_details_update( $params = array() ) {
    if ( empty( $params ) && ( ! is_array( $params ) ) ) {
        return;
    }
    $task_id         = array();
    $task_details_id = array();
    global $wpdb;
    foreach ( $params as $param ) {
        if ( empty( $param['task_id'] ) || empty( $param['action'] ) || empty( $param['status'] ) || empty( $param['record_id'] ) || empty( $param['field'] ) ) {
            continue;
        }
        $task_id = array( $param['task_id'] );
        $wpdb->query(
            $wpdb->prepare(
                "INSERT INTO {$wpdb->prefix}sm_task_details( task_id, action, status, record_id, field, prev_val, updated_val )
                VALUES( %d, %s, %s, %d, %s, %s, %s )",
                $param['task_id'],
                $param['action'],
                $param['status'],
                $param['record_id'],
                $param['field'],
                ( isset( $param['prev_val'] ) ) ? maybe_serialize( $param['prev_val'] ) : '',
                ( isset( $param['updated_val'] ) ) ? maybe_serialize( $param['updated_val'] ) : ''
            )
        );
        $task_details_id[] = ( ! is_wp_error( $wpdb->insert_id ) ) ? $wpdb->insert_id : array();
    }
    if ( ( ! empty( $task_details_id ) ) && ( count( $params ) === count( $task_details_id ) ) ) {
        sm_task_update(
            array(
                'task_id' => implode( '', $task_id ),
                'status' => 'completed',
                'completed_date' => date( 'Y-m-d H:i:s' )
            )
        );
    }
}

/**
 * Get singular label of a post type.
 *
 * @param string $post_type Post type slug.
 * @return string Singular label or empty string if not found.
 */
function sm_get_post_type_singular_name( $post_type = '' ) {
	if ( empty( $post_type ) ) {
		return;
	}
	$post_type_obj = get_post_type_object( $post_type );
	if ( empty( $post_type_obj ) || ! is_object( $post_type_obj ) || empty( $post_type_obj->labels->singular_name ) ) {
		return;
	}
	return $post_type_obj->labels->singular_name;
}

/**
 * Parse column model to extract CSV export metadata.
 *
 * @param array $col_model Column model array.
 * @return array Array with 'headers', 'select_cols', 'numeric_cols', 'fields'.
 */
function sa_sm_parse_csv_columns( $col_model = array() ) {
	if ( empty( $col_model ) || ! is_array( $col_model ) ) {
		return;
	}
	$headers      = array();
	$select_cols  = array();
	$numeric_cols = array();
	foreach ( $col_model as $col ) {
		if ( empty( $col['exportable'] ) || ! empty( $col['hidden'] ) ) {
			continue;
		}

		$headers[ $col['data'] ] = $col['key'];

		if ( ! empty( $col['values'] ) ) {
			$select_cols[ $col['data'] ] = $col['values'];
		}

		if ( ( ! empty( $col['type'] ) && 'numeric' === $col['type'] ) || ( ! empty( $col['validator'] ) && 'customNumericTextEditor' === $col['validator'] ) ) {
			$numeric_cols[] = $col['data'];
		}
	}

	return array(
		'headers'      => $headers,
		'select_cols'  => $select_cols,
		'numeric_cols' => $numeric_cols,
		'fields'       => array_keys( $headers ),
	);
}

/**
 * Format a single row of data for CSV export.
 *
 * @param array $row         Row data.
 * @param array $fields      Column field keys.
 * @param array $select_cols Select/dropdown column values mapping.
 * @param array $numeric_cols Numeric column keys.
 * @return string Formatted CSV row string.
 */
function sa_sm_format_csv_row( $row = array(), $fields = array(), $select_cols = array(), $numeric_cols = array() ) {
	if ( empty( $row ) || ! is_array( $row ) || empty( $fields ) || ! is_array( $fields ) ) {
		return '';
	}

	$select_cols  = ( ! empty( $select_cols ) && is_array( $select_cols ) ) ? $select_cols : array();
	$numeric_cols = ( ! empty( $numeric_cols ) && is_array( $numeric_cols ) ) ? $numeric_cols : array();
	$escaped_cols = apply_filters( 'sa_sm_escaped_html_columns', array( 'posts_post_excerpt', 'posts_post_content' ) );
	$escaped_cols = ( ! empty( $escaped_cols ) && is_array( $escaped_cols ) ) ? $escaped_cols : array();
	$row_data     = array();

	foreach ( $fields as $field ) {
		$value = isset( $row[ $field ] ) ? $row[ $field ] : '';

		// Map select/dropdown values to their labels.
		if ( ! empty( $select_cols[ $field ] ) && is_array( $select_cols[ $field ] ) && ! empty( $value ) ) {
			$value = isset( $select_cols[ $field ][ $value ] ) ? $select_cols[ $field ][ $value ] : $value;
		}

		// Replace line breaks.
		$value = str_replace( array( "\n", "\r\n", "\n\r", "\r" ), "\t", $value );
		$value = str_replace( '<br>', "\n", $value );

		// Escape double quotes.
		$value = str_replace( '"', '""', $value );

		// Handle non-numeric columns - parse CSV values.
		if ( empty( $numeric_cols ) || ! in_array( $field, $numeric_cols, true ) ) {
			if ( ! is_array( $value ) ) {
				$value = str_getcsv( $value, ',', '"', '\\' );
			}
			$value = ( $value && is_array( $value ) ) ? implode( ', ', $value ) : '';
		}

		// Escape HTML for specific columns.
		if ( ! empty( $escaped_cols ) && in_array( $field, $escaped_cols, true ) ) {
			$value = esc_html( $value );
		}

		$row_data[] = '"' . $value . '"';
	}

	return implode( ',', $row_data );
}
