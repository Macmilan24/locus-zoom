import React, { useEffect } from "react";
import LocusZoom from 'locuszoom'
import 'locuszoom/dist/locuszoom.css';

const LZoom = () => {
    
  useEffect(() => {

    // Ensure LocusZoom is available globally (e.g., loaded via a script in your index.html)
    const data_sources = new LocusZoom.DataSources();
    const apiBase = 'https://portaldev.sph.umich.edu/api/v1/';
    data_sources
    .add("phewas", ["PheWASLZ", {
        url: "https://portaldev.sph.umich.edu/" + "api/v1/statistic/phewas/",
        build: ["GRCh37"]
    }])
    .add("gene", ["GeneLZ", { url: apiBase + "annotation/genes/", build: 'GRCh37' }])
    .add("constraint", ["GeneConstraintLZ", { url: "https://gnomad.broadinstitute.org/api/", build: 'GRCh37' }]);

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

    // Initialize the LocusZoom plot
    LocusZoom.populate("#lz-plot", data_sources, layout);
  }, []); // Empty dependency array to ensure it runs once after mount

  return (
    <div>
      {/* LocusZoom container */}
      <div id="lz-plot"></div>
      {/* <div id="">kdkljnklsdnkln</div> */}
    </div>
  );
};

export default LZoom;
