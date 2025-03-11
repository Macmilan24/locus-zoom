import React, { useEffect, useRef } from "react";
import 'locuszoom/dist/locuszoom.css';
import './../../public/style.css'
import LocusZoom from 'locuszoom'

const LZoom = ({ start = 53673256, end = 53831146, variant }) => {

  const plotRef = useRef(null);
  const inputRef = useRef(null);
  const rangeDifference = end - start; // Calculate the difference
  const namespace = "cojo"

  useEffect(() => {

    // Create the LocusZoom plot
    if (plotRef.current) {
      const baseUrl = "http://100.67.47.42:5011/json/"

      // Data Sources - APIs LocusZoom will connect to for various pieces of data
      var data_sources = new LocusZoom.DataSources()
        .add("sig", ["StaticJSON", { data: [{ "x": 0, "y": 7.30103 }, { "x": 2881033286, "y": 7.30103 }] }])
        .add("gene", ["GeneLZ", {
          url: "http://portaldev.sph.umich.edu/api/v1/annotation/genes/", 
        }])
        .add("constraint", ["GeneConstraintLZ", {
          url: "http://exac.broadinstitute.org/api/constraint",
        }])
        .add("recomb", ["RecombLZ", {
          url: "http://portaldev.sph.umich.edu/api/v1/annotation/recomb/results/",
        }])
        .add("ld", ["LDServer", {
          url: "https://portaldev.sph.umich.edu/ld/" ,
        }])
        .add(namespace, ["AssociationLZ", {
          url: `${baseUrl}`,
        }])

      var mods = {
        namespace: { "default": namespace, "assoc": namespace, ld: "ld" },
        id: namespace,
        title: { text: "Author" + " " + 2013 + " - " + "adv" },
        y_index: -1,
      };

      var initial_layout = {
        state: {
          chr: 16,
          start,
          end,
          ld_pop: "EUR",
          genome_build: "GRCh37",
          variant
        },
        responsive_resize: true,
        max_region_scale: rangeDifference,     
        aspect_ratio: 2,
        dashboard: LocusZoom.Layouts.get("toolbar", "region_nav_plot"),
        panels: [
          LocusZoom.Layouts.get("panel", "genes"),
          LocusZoom.Layouts.get("panel", "association", mods)
        ]
      };

      initial_layout.panels[0].toolbar.widgets.splice(0, 1);
      initial_layout.panels[0].toolbar.widgets[0].group_position = "end";

      const plot = LocusZoom.populate(plotRef.current, data_sources, initial_layout);
      plot.on("layout_changed", function () {
        inputRef.current.value = plot.state.chr + ":" + plot.state.start + "-" + plot.state.end;
      });

    }
  }, [start, end, variant]);

  return (
    <div>
      <div id="lz-plot" ref={plotRef}></div>
      <input id="input_region" ref={inputRef} type="text" placeholder="Navigate to Region" readOnly />
    </div>
  );
};

export default LZoom;
