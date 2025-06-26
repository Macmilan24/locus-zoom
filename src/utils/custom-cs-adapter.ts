import {marking, scoring} from 'gwas-credible-sets';

function install (LocusZoom) {
    const BaseUMAdapter = LocusZoom.Adapters.get('BaseUMAdapter');


    class CredibleSetLZ extends BaseUMAdapter {
        /**
         * @param {Number} [config.params.threshold=0.95] The credible set threshold (eg 95%). Will continue selecting SNPs
         *  until the posterior probabilities add up to at least this fraction of the total.
         * @param {Number} [config.params.significance_threshold=7.301] Do not perform a credible set calculation for this
         *  region unless AT LEAST ONE SNP (as -log10p) exceeds the line of GWAS signficance. Otherwise we are declaring a
         *  credible set when there is no evidence of anything being significant at all. If one snp is significant, it will
         *  create a credible set for the entire region; the resulting set may include things below the line of significance.
         */
        constructor(config) {
            super(...arguments);
            // Set defaults. Default sig threshold is the line of GWAS significance. (as -log10p)
            this._config = Object.assign(
                { threshold: 0.95, significance_threshold: 7.301 },
                this._config,
            );
            this._prefix_namespace = false;
        }

        _getCacheKey (state) {
            console.log({state})
            const threshold = state.credible_set_threshold || this._config.threshold;
            return [threshold, state.chr, state.start, state.end].join('_');
        }

        _buildRequestOptions(options, assoc_data) {
            const base = super._buildRequestOptions(...arguments);
            // console.log({base})
            base._assoc_data = assoc_data;
            // base.assoc = 
            return base;
        }

        _performRequest(options) {
            const {_assoc_data} = options;
            if (!_assoc_data.length) {
                console.log("no credible sets")
                // No credible set can be calculated because there is no association data for this region
                return Promise.resolve([]);
            }

            const assoc_logp_name = this._findPrefixedKey(_assoc_data[0], 'log_pvalue');

            const threshold = this._config.threshold;
            // console.log({assoc_logp_name})
            // console.log({_assoc_data})
            // Calculate raw bayes factors and posterior probabilities based on information returned from the API
            const nlogpvals = _assoc_data.map((item) => item[assoc_logp_name]);

            if (!nlogpvals.some((val) => val >= this._config.significance_threshold)) {
                // If NO points have evidence of significance, define the credible set to be empty
                //  (rather than make a credible set that we don't think is meaningful)
                return Promise.resolve(_assoc_data);
            }

            try {
                for (let i = 0; i < _assoc_data.length; i++) {
                    _assoc_data[i][`${options._provider_name}:posterior_prob`] =  _assoc_data[i]["assoc:posterior_prob"];
                    _assoc_data[i][`${options._provider_name}:contrib_fraction`] =  _assoc_data[i]["assoc:contrib_fraction"];
                    _assoc_data[i][`${options._provider_name}:is_member`] =  _assoc_data[i]["assoc:is_member"];
                }
            } catch (e) {
                // If the calculation cannot be completed, return the data without annotation fields
                console.error(e);
            }
            return Promise.resolve(_assoc_data);
        }
    }

    LocusZoom.Adapters.add('Custom-CredibleSetLZ', CredibleSetLZ);

    // Add related layouts to the central global registry
    /**
     * (**extension**) Tooltip layout that appends credible set posterior probability to the default association tooltip (for SNPs in the credible set)
     * @alias module:LocusZoom_Layouts~association_credible_set_tooltip
     * @type tooltip
     * @see {@link module:ext/lz-credible-sets} for required extension and installation instructions
     */
    const association_credible_set_tooltip = function () {
        // Extend a known tooltip with an extra row of info showing posterior probabilities
        const l = LocusZoom.Layouts.get('tooltip', 'standard_association');
        l.html += '{{#if credset:posterior_prob}}<br>Posterior probability: <strong>{{credset:posterior_prob|scinotation|htmlescape}}</strong>{{/if}}';
        l.html += '\n <button> Enrich </button>{{/if}}';
        return l;
    }();

    LocusZoom.Layouts.add('tooltip', 'association_credible_set', association_credible_set_tooltip);

    /**
     * (**extension**) A tooltip layout for annotation (rug) tracks that provides information about credible set members
     * @alias module:LocusZoom_Layouts~annotation_credible_set_tooltip
     * @type tooltip
     * @see {@link module:ext/lz-credible-sets} for required extension and installation instructions
     */
    const annotation_credible_set_tooltip = {
        closable: true,
        show: { or: ['highlighted', 'selected'] },
        hide: { and: ['unhighlighted', 'unselected'] },
        html: '<strong>{{assoc:variant|htmlescape}}</strong><br>'
            + 'P Value: <strong>{{assoc:log_pvalue|logtoscinotation|htmlescape}}</strong><br>' +
            '{{#if credset:posterior_prob}}<br>Posterior probability: <strong>{{credset:posterior_prob|scinotation|htmlescape}}</strong>{{/if}}',
    };
    LocusZoom.Layouts.add('tooltip', 'annotation_credible_set', annotation_credible_set_tooltip);

    /**
     * (**extension**) A data layer layout that shows GWAS summary statistics overlaid with credible set membership information
     * @alias module:LocusZoom_Layouts~association_credible_set_layer
     * @type data_layer
     * @see {@link module:ext/lz-credible-sets} for required extension and installation instructions
     */

    const association_credible_set_layer = function () {
        const base = LocusZoom.Layouts.get('data_layer', 'association_pvalues', {
            id: 'associationcredibleset',
            namespace: { 'assoc': 'assoc', 'credset': 'credset', 'ld': 'ld' },
            data_operations: [
                {
                    type: 'fetch',
                    from: ['assoc', 'ld(assoc)', 'credset(assoc)'],
                },
                {
                    type: 'left_match',
                    name: 'credset_plus_ld',
                    requires: ['credset', 'ld'],  // The credible sets demo wasn't fully moved over to the new data operations system, and as such it is a bit weird
                    params: ['assoc:position', 'ld:position2'],  // FIXME: old LZ used position, because it was less sensitive to format. We'd like to match assoc:variant = ld:variant2, but not every assoc source provides variant data in the way we need. This would need to be fixed via special formatting adjustment later.
                },
            ],
            fill_opacity: 0.7,
            tooltip: LocusZoom.Layouts.get('tooltip', 'association_credible_set'),
            match: { send: 'assoc:variant', receive: 'assoc:variant' },
        });
        base.color.unshift({
            field: 'lz_is_match',  // Special field name whose presence triggers custom rendering
            scale_function: 'if',
            parameters: {
                field_value: true,
                then: '#FFf000',
            },
        });
        return base;
    }();
    LocusZoom.Layouts.add('data_layer', 'association_credible_set', association_credible_set_layer);

    /**
     * (**extension**) A data layer layout that shows a vertical mark whenever a SNP is a member of the credible set
     * @alias module:LocusZoom_Layouts~annotation_credible_set_layer
     * @type data_layer
     * @see {@link module:ext/lz-credible-sets} for required extension and installation instructions
     */
    const annotation_credible_set_layer = {
        namespace: { 'assoc': 'assoc', 'credset': 'credset' },
        data_operations: [{
            type: 'fetch',
            from: ['assoc', 'credset(assoc)'],
        }],
        id: 'annotationcredibleset',
        type: 'annotation_track',
        id_field: 'assoc:variant',
        x_axis: {
            field: 'assoc:position',
        },
        color: [
            {
                field: 'lz_is_match',  // Special field name whose presence triggers custom rendering
                scale_function: 'if',
                parameters: {
                    field_value: true,
                    then: '#001cee',
                },
            },
            '#00CC00',
        ],
        match: { send: 'assoc:variant', receive: 'assoc:variant' },
        filters: [
            // Specify which points to show on the track. Any selection must satisfy ALL filters
            { field: 'credset:is_member', operator: '=', value: true },
        ],
        behaviors: {
            onmouseover: [
                { action: 'set', status: 'highlighted' },
            ],
            onmouseout: [
                { action: 'unset', status: 'highlighted' },
            ],
            onclick: [
                { action: 'toggle', status: 'selected', exclusive: true },
            ],
            onshiftclick: [
                { action: 'toggle', status: 'selected' },
            ],
        },
        tooltip: LocusZoom.Layouts.get('tooltip', 'annotation_credible_set'),
        tooltip_positioning: 'top',
    };
    LocusZoom.Layouts.add('data_layer', 'annotation_credible_set', annotation_credible_set_layer);

    /**
     * (**extension**) A panel layout that shows a vertical mark whenever a SNP is a member of the credible set
     * @alias module:LocusZoom_Layouts~annotation_credible_set
     * @type panel
     * @see {@link module:ext/lz-credible-sets} for required extension and installation instructions
     */
    const annotation_credible_set = {
        id: 'annotationcredibleset',
        title: { text: 'SNPs in 95% credible set', x: 50, style: { 'font-size': '14px' } },
        min_height: 50,
        height: 50,
        margin: { top: 25, right: 50, bottom: 10, left: 70 },
        inner_border: 'rgb(210, 210, 210)',
        toolbar: LocusZoom.Layouts.get('toolbar', 'standard_panel'),
        axes: {
            x: { extent: 'state', render: false },
        },
        interaction: {
            drag_background_to_pan: true,
            scroll_to_zoom: true,
            x_linked: true,
        },
        data_layers: [
            LocusZoom.Layouts.get('data_layer', 'annotation_credible_set'),
        ],
    };
    LocusZoom.Layouts.add('panel', 'annotation_credible_set', annotation_credible_set);

    /**
     * (**extension**) A panel layout that shows GWAS summary statistics in a standard LocusZoom view, overlaid with credible set membership information
     * @alias module:LocusZoom_Layouts~association_credible_set
     * @type panel
     * @see {@link module:ext/lz-credible-sets} for required extension and installation instructions
     */
    const association_credible_set_panel = function () {
        const l = LocusZoom.Layouts.get('panel', 'association', {
            id: 'associationcrediblesets',
            data_layers: [
                LocusZoom.Layouts.get('data_layer', 'significance'),
                LocusZoom.Layouts.get('data_layer', 'recomb_rate'),
                LocusZoom.Layouts.get('data_layer', 'association_credible_set'),
            ],
        });
        // Add "display options" button to control how credible set coloring is overlaid on the standard association plot
        l.toolbar.widgets.push(
            {
                type: 'display_options',
                position: 'right',
                color: 'blue',
                // Below: special config specific to this widget
                button_html: 'Display options...',
                button_title: 'Control how plot items are displayed',
                layer_name: 'associationcredibleset',
                default_config_display_name: 'Linkage Disequilibrium (default)', // display name for the default plot color option (allow user to revert to plot defaults)

                options: [
                    {
                        // First dropdown menu item
                        display_name: '95% credible set (boolean)',  // Human readable representation of field name
                        display: {  // Specify layout directives that control display of the plot for this option
                            point_shape: 'circle',
                            point_size: 40,
                            color: {
                                field: 'credset:is_member',
                                scale_function: 'if',
                                parameters: {
                                    field_value: true,
                                    then: '#00CC00',
                                    else: '#CCCCCC',
                                },
                            },
                            legend: [ // Tells the legend how to represent this display option
                                {
                                    shape: 'circle',
                                    color: '#00CC00',
                                    size: 40,
                                    label: 'In credible set',
                                    class: 'lz-data_layer-scatter',
                                },
                                {
                                    shape: 'circle',
                                    color: '#CCCCCC',
                                    size: 40,
                                    label: 'Not in credible set',
                                    class: 'lz-data_layer-scatter',
                                },
                            ],
                        },
                    },
                    {
                        // Second option. The same plot- or even the same field- can be colored in more than one way.
                        display_name: '95% credible set (gradient by contribution)',
                        display: {
                            point_shape: 'circle',
                            point_size: 40,
                            color: [
                                {
                                    field: 'credset:contrib_fraction',
                                    scale_function: 'if',
                                    parameters: {
                                        field_value: 0,
                                        then: '#777777',
                                    },
                                },
                                {
                                    scale_function: 'interpolate',
                                    field: 'credset:contrib_fraction',
                                    parameters: {
                                        breaks: [0, 1],
                                        values: ['#fafe87', '#9c0000'],
                                    },
                                },
                            ],
                            legend: [
                                {
                                    shape: 'circle',
                                    color: '#777777',
                                    size: 40,
                                    label: 'No contribution',
                                    class: 'lz-data_layer-scatter',
                                },
                                {
                                    shape: 'circle',
                                    color: '#fafe87',
                                    size: 40,
                                    label: 'Some contribution',
                                    class: 'lz-data_layer-scatter',
                                },
                                {
                                    shape: 'circle',
                                    color: '#9c0000',
                                    size: 40,
                                    label: 'Most contribution',
                                    class: 'lz-data_layer-scatter',
                                },
                            ],
                        },
                    },
                ],
            },
        );
        return l;
    }();
    LocusZoom.Layouts.add('panel', 'association_credible_set', association_credible_set_panel);

    /**
     * (**extension**) A standard LocusZoom plot layout, with additional credible set information.
     * @alias module:LocusZoom_Layouts~association_credible_set_plot
     * @type plot
     * @see {@link module:ext/lz-credible-sets} for required extension and installation instructions
     */
    const association_credible_set_plot = {
        state: {},
        width: 800,
        height: 450,
        responsive_resize: true,
        min_region_scale: 20000,
        max_region_scale: 1000000,
        toolbar: LocusZoom.Layouts.get('toolbar', 'standard_association'),
        panels: [
            LocusZoom.Layouts.get('panel', 'association_credible_set'),
            LocusZoom.Layouts.get('panel', 'annotation_credible_set'),
            LocusZoom.Layouts.get('panel', 'genes'),
        ],
    };
    LocusZoom.Layouts.add('plot', 'association_credible_set', association_credible_set_plot);
}


if (typeof LocusZoom !== 'undefined') {
    // Auto-register the plugin when included as a script tag. ES6 module users must register via LocusZoom.use()
    // eslint-disable-next-line no-undef
    LocusZoom.use(install);
}


export default install;
