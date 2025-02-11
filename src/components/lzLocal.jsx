import React, { useEffect } from "react";
import LocusZoom from 'locuszoom';
import 'locuszoom/dist/locuszoom.css';

const LZoomLocal = () => {
  useEffect(() => {
    // Data sources for LocusZoom
    const dataSources = new LocusZoom.DataSources()
    .add('assoc', ['AssociationLZ', { 
        url: '/Data/df_locus_zoom.csv',
        delimiter: '\t',
        fields: { snp: 'SNPID', chrom: 'CHR', position: 'BP', pvalue: 'P' }
      }])  // Association Data with headers
      .add('LD', ['LDServer', { url: '/Data/sig_locus_mt(1).ld' }]);  // LD Matrix Data

    // Define the region of interest
    const variantForPlot = "16:53668214:T:G";
    // const VARIANT_PATTERN = /(\d+):(\d+)_([ATGC])\/([ATGC])/;
    const VARIANT_PATTERN = /(\d+):(\d+):([ATGC]+):([ATGC]+)/;

    const variantGroups = VARIANT_PATTERN.exec(variantForPlot);
    const variantChrom = variantGroups[1];
    const variantPosition = +variantGroups[2];
    console.log("Data sources added:", {dataSources});

    // Layout for the LocusZoom plot
    const layout = {
      width: 800,
      height: 600,
      panels: [
        {
          id: "association",
          title: "Association Results",
          data_layers: [
            {
              id: "assoc_points",
              type: "scatter",
              fields: ["assoc:chrom", "assoc:position", "assoc:pvalue"],
              x_axis: { field: "assoc:position" },
              y_axis: {
                field: "assoc:pvalue",
                scale_function: "-log10",
                axis_label: "-log10(p-value)"
              },
              point_shape: "circle",
              point_size: 40,
              color: {
                field: "LD:r2",
                scale_function: "linear",
                parameters: { domain: [0, 1], range: ["#d3d3d3", "#ff0000"] }
              },
              tooltip: {
                html: "<strong>SNP:</strong> {{assoc:SNPID}}<br><strong>P-value:</strong> {{assoc:P}}"
              }
            }
          ]
        }
      ]
    };

    var mods = {
        state: {
            variant: variantForPlot,
            start: variantPosition - 2,
            end: variantPosition + 2,
        chr: variantChrom
        }
    }


    // Initialize the LocusZoom plot
    LocusZoom.populate("#lz-plot", dataSources, mods);
    console.log({kk:LocusZoom.populate("#lz-plot", dataSources, mods)})
  }, []); // Run once on component mount

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>LocusZoom Visualization</h1>
      <div id="lz-plot"></div>
    </div>
  );
};

export default LZoomLocal;

// import React, { useEffect, useRef } from 'react';
// import LocusZoom from 'locuszoom';

// const LZoomLocal = () => {
//     const plotRef = useRef(null);

//     useEffect(() => {
//         const dataSources = new LocusZoom.DataSources()
//             .add('assoc', ['AssociationLZ', { url: '/Data/df_locus_zoom.csv' }])  // Association Data
//             .add('LD', ['LDServer', { url: '/Data/sig_locus_mt_r2(1).ld' }]);  // LD Data (R² values)
        
//         var variantForPlot = "10:114758349_C/T";
//         // Throughout this demo, we will match variants of the format 10:100_C/T
//         var VARIANT_PATTERN = /(\d+):(\d+)_([ATGC])\/([ATGC])/;
    
//         // Break the variant into constituent parts for setting plot state
//         var variantGroups = VARIANT_PATTERN.exec(variantForPlot);
//         var variantChrom = variantGroups[1];
//         var variantPosition = +variantGroups[2];
    
//         var mods = {
//             state: {
//                 variant: variantForPlot,
//                 start: variantPosition - 250000,
//                 end: variantPosition + 250000,
//             chr: variantChrom
//             }
//         }
//         console.log(LocusZoom.Layouts.list("plot"))
//         // var layout = LocusZoom.Layouts.get("plot", "standard_association", mods);
        
//         const layout = {
//             width: 800,
//             height: 600,
//             panels: [
//                 {
//                     id: 'association',
//                     data_layers: [
//                         {
//                             id: 'assoc_points',
//                             type: 'scatter',
//                             data: 'assoc',
//                             fields: ['assoc:POS', 'assoc:P'],
//                         },
//                     ],
//                 },
//                 {
//                     id: 'ld_panel',
//                     data_layers: [
//                         {
//                             id: 'ld',
//                             type: 'ld',
//                             data: 'ld',
//                             fields: ['ld:SNP_A', 'ld:SNP_B', 'ld:R2'],
//                         },
//                     ],
//                 },
//             ],
//         };

//         LocusZoom.populate("#lz-plot", dataSources, layout);
//     }, []);

//     return (
//         <div>
//             <h1 style={{ textAlign: 'center' }}>LocusZoomLocal Visualization</h1>
//             <div style={{ width: '100%', height: '600px' }}></div>
//             <div id="lz-plot"></div>

//         </div>
//     );
// }

// export default LZoomLocal;