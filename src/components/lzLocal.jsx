import React, { useEffect, useRef } from 'react';
import LocusZoom from 'locuszoom';

const LZoomLocal = () => {
    const plotRef = useRef(null);

    useEffect(() => {
        const dataSources = new LocusZoom.DataSources()
            .add('assoc', ['AssociationLZ', { url: '/Data/df_locus_zoom.csv' }])  // Association Data
            .add('ld', ['LDLZ', { url: '/Data/sig_locus_mt_r2(1).ld' }]);  // LD Data (R² values)
        
        var variantForPlot = "10:114758349_C/T";
        // Throughout this demo, we will match variants of the format 10:100_C/T
        var VARIANT_PATTERN = /(\d+):(\d+)_([ATGC])\/([ATGC])/;
    
        // Break the variant into constituent parts for setting plot state
        var variantGroups = VARIANT_PATTERN.exec(variantForPlot);
        var variantChrom = variantGroups[1];
        var variantPosition = +variantGroups[2];
    
        var mods = {
            state: {
                variant: variantForPlot,
                start: variantPosition - 250000,
                end: variantPosition + 250000,
            chr: variantChrom
            }
        }
    
        var layout = LocusZoom.Layouts.get("plot", "standard_phewas", mods);
        
        // const layout = {
        //     width: 800,
        //     height: 600,
        //     panels: [
        //         {
        //             id: 'association',
        //             data_layers: [
        //                 {
        //                     id: 'assoc_points',
        //                     type: 'scatter',
        //                     data: 'assoc',
        //                     fields: ['assoc:POS', 'assoc:PVAL'],
        //                 },
        //             ],
        //         },
        //         {
        //             id: 'ld_panel',
        //             data_layers: [
        //                 {
        //                     id: 'ld',
        //                     type: 'ld',
        //                     data: 'ld',
        //                     fields: ['ld:SNP_A', 'ld:SNP_B', 'ld:R2'],
        //                 },
        //             ],
        //         },
        //     ],
        // };

        LocusZoom.populate(plotRef.current, dataSources, layout);
    }, []);

    return (
        <div>
            <h1 style={{ textAlign: 'center' }}>LocusZoomLocal Visualization</h1>
            <div style={{ width: '100%', height: '600px' }}></div>
        </div>
    );
}

export default LZoomLocal;