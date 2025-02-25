import React, { useEffect, useRef } from "react";
import 'locuszoom/dist/locuszoom.css';
import LocusZoom from 'locuszoom'
import json from './../assets/data/genes.json'
const LZoom = () => {

  const plotRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
  
    // Create the LocusZoom plot
    if (plotRef.current) {
      const genes_data = [
        { gene_name: "BRCA1", gene_id: "ENSG00000012048.1", chrom: "17", start: 43044295, end: 43125482 },
        { gene_name: "TP53", gene_id: "ENSG00000141510.1", chrom: "17", start: 7668402, end: 7687550 },
        { gene_name: "Y_RNA", gene_id: "ENSG00000207243.1", chrom: "16", start: 228553, end: 228655 },
        // More gene objects...
      ];

      // Data Sources - APIs LocusZoom will connect to for various pieces of data
    var data_sources = new LocusZoom.DataSources()
    .add("sig", ["StaticJSON", { data: [{ "x": 0, "y": 7.30103 }, { "x": 2881033286, "y": 7.30103 }] }])
    .add("gene", ["GeneLZ", { 
      // url: "http://localhost:3000/gene/", 
      url: "http://portaldev.sph.umich.edu/api/v1/annotation/genes/", 
      build: 'GRCh37'
    }])
    .add("constraint", ["GeneConstraintLZ", {
      url: "http://exac.broadinstitute.org/api/constraint",
      build: 'GRCh37'
    }])
    .add("recomb", ["RecombLZ", {
      // url: "http://localhost:3000/recomb/", 
      url: "http://portaldev.sph.umich.edu/api/v1/annotation/recomb/results/", 
      params: {source: 15} } ])
    .add("ld", ["LDServer", { 
      // url: "http://localhost:3000/ld/" 
      url: "https://portaldev.sph.umich.edu/ld/" ,
      variant: "16:53668214:T:G",
      }])
    .add("study_41", ["AssociationLZ", { 
      // url: "http://localhost:3000/single/", 
      url: "http://portaldev.sph.umich.edu/api/v1/single/", 
      params:{ source: 41 } 
    }]
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

  // const variantForPlot = "16:53668214:T:G";

  var initial_layout = {
    state: {
      chr: 16,
      // variant: variantForPlot,
      start: 200000,
      end: 800000,
    },
  responsive_resize: true,
  min_region_scale: 1000,
  // max_region_scale: 10000,
  aspect_ratio: 4,
  dashboard: LocusZoom.Layouts.get("toolbar", "region_nav_plot"),
  panels: [
    LocusZoom.Layouts.get("panel","genes"),
    LocusZoom.Layouts.get("panel", "association", mods)
  ]};

  console.log({il:initial_layout.panels[1]})
  initial_layout.panels[0].toolbar.widgets.splice(0,1);
  initial_layout.panels[0].toolbar.widgets[0].group_position = "end";
  console.log({pnl:initial_layout.panels})
  
  console.log({ip:initial_layout.panels})
  // initial_layout.panels[1].curtain.show("Loading Study...", { "text-align": "center" });
  // initial_layout.panels[1].on("data_rendered", function(){
  //     this.curtain.hide();
  //     this.legend.render();
  // });
  // // !
  const plot = LocusZoom.populate(plotRef.current, data_sources, initial_layout);
  plot.on("layout_changed", function(){
    inputRef.current.value = plot.state.chr + ":" + plot.state.start + "-" + plot.state.end;
  });
  
   }
    

  }, []); // Empty dependency array to ensure it runs once after mount

  return (
    <div>
      {/* LocusZoom container */}
      <div id="lz-plot" ref={plotRef}></div>
      <input id="input_region" ref={inputRef} type="text" placeholder="Navigate to Region" readOnly />
    </div>
  );
};

export default LZoom;
