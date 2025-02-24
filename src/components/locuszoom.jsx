import React, { useEffect, useRef } from "react";
import 'locuszoom/dist/locuszoom.css';
import LocusZoom from 'locuszoom'

const LZoom = () => {

  const plotRef = useRef(null);

  useEffect(() => {
  
    // Create the LocusZoom plot
    if (plotRef.current) {
    
      // Data Sources - APIs LocusZoom will connect to for various pieces of data
    var data_sources = new LocusZoom.DataSources()
    .add("gene", ["GeneLZ", { 
      url: "http://portaldev.sph.umich.edu/api/v1/annotation/genes/", 
      build: 'GRCh37'
    }])
    .add("constraint", ["GeneConstraintLZ", {
      url: "http://exac.broadinstitute.org/api/constraint",
      build: 'GRCh37'
    }])
    .add("recomb", ["RecombLZ", { url: "http://portaldev.sph.umich.edu/api/v1/annotation/recomb/results/", source: 15 } ])
    .add("sig", ["StaticJSON", { data: [{ "x": 0, "y": 7.30103 }, { "x": 2881033286, "y": 7.30103 }] }])
    .add("ld", ["LDServer", { url: "https://portaldev.sph.umich.edu/ld/" }])
    .add("study_41", ["AssociationLZ", { url: "http://portaldev.sph.umich.edu/api/v1/single/", source: 41  }]
)

    // Layout - the description of the plot and how data is presented. We start with only the genes panel.
  var namespace = "study_41"
  var id = 41
  var mods = {
    namespace: { "default": namespace, "assoc": namespace, ld: "ld" },
    id: namespace,
    title: { text: "Author" + " " + 2013 + " - " + "adv" },
    y_index: -1,
  };

  var initial_layout = {
    state: {
      chr: 16,
      start: 200000,
      end: 300000,
    },
    responsive_resize: true,
    min_region_scale: 100000,
    // max_region_scale: 10000,
    aspect_ratio: 4,
    dashboard: LocusZoom.Layouts.get("toolbar", "region_nav_plot"),
    panels: [
      LocusZoom.Layouts.get("panel","genes"),
      LocusZoom.Layouts.get("panel", "association", mods),
      // LocusZoom.Layouts.get("panel", "ld"),
  ]};

  console.log({il:initial_layout.panels[1]})
  initial_layout.panels[0].toolbar.widgets.splice(0,1);
  initial_layout.panels[0].toolbar.widgets[0].group_position = "end";
  console.log({ip:initial_layout.panels})
  // initial_layout.panels[1].curtain.show("Loading Study...", { "text-align": "center" });
  // initial_layout.panels[1].on("data_rendered", function(){
  //     this.curtain.hide();
  //     this.legend.render();
  // });
  // // !
  LocusZoom.populate(plotRef.current, data_sources, initial_layout);

   }
    

  }, []); // Empty dependency array to ensure it runs once after mount

  return (
    <div>
      {/* LocusZoom container */}
      <div id="lz-plot" ref={plotRef}></div>
      <input id="input_region" type="text" placeholder="Navigate to Region" readOnly />
    </div>
  );
};

export default LZoom;
