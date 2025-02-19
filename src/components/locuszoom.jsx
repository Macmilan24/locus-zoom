import React, { useEffect, useRef } from "react";
import 'locuszoom/dist/locuszoom.css';
import LocusZoom from 'locuszoom'
// import * as d3 from "d3"


const LZoom = () => {

  const plotRef = useRef(null);

  useEffect(() => {
    
    // Create the LocusZoom plot
    if (plotRef.current) {
              // Data Sources - APIs LocusZoom will connect to for various pieces of data
    var data_sources = new LocusZoom.DataSources()
    .add("gene", ["GeneLZ", { 
      url: "http://portaldev.sph.umich.edu/api/v1/annotation/genes/", 
      build: 'GRCh38'
    }])
    .add("constraint", ["GeneConstraintLZ", {
      url: "http://exac.broadinstitute.org/api/constraint",
      build: 'GRCh38'
    }])
    .add("recomb", ["RecombLZ", { url: "http://portaldev.sph.umich.edu/api/v1/annotation/recomb/results/", params: {source: 15} } ])
    .add("sig", ["StaticJSON", { data: [{ "x": 0, "y": 7.30103 }, { "x": 2881033286, "y": 7.30103 }] }])
    .add("ld", ["LDServer", { url: "http://portaldev.sph.umich.edu/api/v1/pair/LD/" }])
    .add("study_41", ["AssociationLZ", { 
      url: "http://portaldev.sph.umich.edu/api/v1/single/",
      params:{
        analysis: 41,
        id_field: "variant"}
      }
  ])


    // Layout - the description of the plot and how data is presented. We start with only the genes panel.
    var initial_layout = {
      state: {
        chr: "16",
        start: 200000,
        end: 300000
      },
    responsive_resize: true,
    min_region_scale: 30000,
    // max_region_scale: 10000,
    aspect_ratio: 4,
    dashboard: LocusZoom.Layouts.get("toolbar", "region_nav_plot"),
    panels: [
      LocusZoom.Layouts.get("panel","genes")
    ]};
    initial_layout.panels[0].toolbar.widgets.splice(0,1);
    initial_layout.panels[0].toolbar.widgets[0].group_position = "end";
    // !
      console.log({ref:LocusZoom.Layouts.list()})
      var plot = LocusZoom.populate(plotRef.current, data_sources, initial_layout);
      // Whenever the plot is updated make sure the value in the "Navigate to Region" input is correct
      plot.on("layout_changed", function(){
        document.getElementById("input_region").value = plot.state.chr + ":" + plot.state.start + "-" + plot.state.end;
      });

      var studies = {};
      var studies_array = [];
      var pubmed_id_list = "";
      var study_ids_by_pmid = {};
      var study_ids_by_pmid_list_idx = [];
    
      // // // var plot = LocusZoom.populate(plot.current, data_sources, initial_layout);
      plot.panels.genes.curtain.show("Loading Genes...", { "text-align": "center" });
      plot.panels.genes.addBasicLoader();
      plot.panels.genes.on("data_rendered", function(){ this.curtain.hide(); });
  
      //!
      var namespace = "study_41"
      var id = 41
      var mods = {
        namespace: { "default": namespace, "assoc": namespace, ld: "ld" },
        id: namespace,
        title: { text: "firt" + " " + 2013 + " - " + "adv" },
        y_index: -1,
      };
      var layout = LocusZoom.Layouts.get("panel", "association", mods);
      console.log({tl:layout.toolbar})
      console.log(layout.toolbar.components)
      layout.toolbar.widgets.push({ type: "menu", color: "yellow", position: "right", "button_html": "Abstract", "menu_html": "<h3 style=\"margin-top: 0px;\">" + 'h2' + "</h3>" + ("studies[id].abstract" || "<i>Requesting abstract from PubMed...</i>") });
  
      // Add the panel and set up event handlers
      var panel = plot.addPanel(layout).addBasicLoader();
      console.log({panel})
      panel.curtain.show("Loading Study...", { "text-align": "center" });
      // panel.on("data_rendered", function(){
      //     this.curtain.hide();
      //     this.legend.render();
      // });
      // plot.on("layout_changed", function(){
          // if (typeof this.panels["study_"+id] == "undefined" && studies[id].on_plot){
              // studies[id].on_plot = false;
              // studies_array[studies[id].array_idx].on_plot = false;
              // $("#add_study_button_"+id).removeClass("button-yellow").addClass("button-green").prop("disabled", false).html("+ Add to plot");
              // 2018-04-05 RPW - disabled until GWAS loci table can be fixed
              // $("#gwas_loci_"+id).remove();
          // }
      // });
      // plot.rescaleSVG();
      // Get the GWAS loci for the study
      // 2018-04-05 RPW - disabled until GWAS loci table can be fixed
      //getGWASLoci(studies[id]);
      // Track the action of adding this study in piwik
      //!

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
