import React, { useEffect } from "react";
import LocusZoom from 'locuszoom';
import 'locuszoom/dist/locuszoom.css';

const LZoomLocal = () => {
  useEffect(() => {
    // Data sources for LocusZoom
    const apiBase = 'https://portaldev.sph.umich.edu/api/v1/';
    const dataSources = new LocusZoom.DataSources()
    .add('assoc', ['AssociationLZ', { 
        build: 'GRCh38',
        url: '/Data/df_locus_zoom.csv',
        delimiter: '\t',
        fields: { snp: 'SNPID', chrom: 'CHR', position: 'BP', pvalue: 'P' }
      }])  // Association Data with headers
      .add("gene", ["GeneLZ", { 
        url: apiBase + "annotation/genes/", 
        build: 'GRCh38' 
      }])
      .add('LD', ['LDServer', { url: '/Data/sig_locus_mt(1).ld', 
        build: 'GRCh38' 
      }]);  // LD Matrix Data


    // Define the region of interest
    const variantForPlot = "16:53668214:T:G";
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
    // LocusZoom.populate("#lz-plot", dataSources, layout);
    try {
      LocusZoom.populate("#lz-plot", dataSources, layout);
    } catch (error) {
      console.error("LocusZoom initialization error:", error);
    }
    console.log({kk:LocusZoom.populate("#lz-plot", dataSources, layout)})
  }, []); // Run once on component mount

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>LocusZoom Visualization</h1>
      <div id="lz-plot"></div>
    </div>
  );
};

export default LZoomLocal;
