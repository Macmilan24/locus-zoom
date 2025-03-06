
**Key Concepts**

* **Data Sources:** LocusZoom fetches data from external sources (APIs or local files). You define these sources using `LocusZoom.DataSources()`.
* **Panels:** Panels are the horizontal sections of the LocusZoom plot, each displaying a specific type of data (genes, association results, LD, etc.).
* **Layout:** The layout defines the overall structure and appearance of the plot, including the panels and dashboard.
* **`mods` Object:** The `mods` object is used to customize the behavior and appearance of individual panels.
* **Namespaces:** Namespaces prevent data field name collisions when using multiple data sources.

**Data Dependencies: A Crucial Relationship**

* **Implicit Dependencies:** LocusZoom panels, especially the `association` panel, can have implicit data dependencies. This means that even if you don't explicitly configure a panel to use a specific data source (like LD), it might still try to use it if it's available.
* **Example:** If you add an `LDServer` data source, the `association` panel might automatically use the LD data to color points or add tooltips. If you remove the `LDServer` data source, the `association` panel might fail to render correctly. Similarly, if using association data, you need to specify recombination data too.
* **Data Source as Foundation:** Data sources define what data is available to all panels. If a panel needs a particular type of data, it must be present in the data sources.

**Panels: Visualizing Genetic Data**

LocusZoom provides several built-in panel types:

* **`genes`:** Displays gene annotations (location and structure of genes).
* **`association`:** Displays association study results (p-values, etc.).
* **`ld`:** Displays linkage disequilibrium (LD) data.
* **`recomb`:** Displays recombination rate data.
* **`constraint`:** Displays gene constraint data.

**Example: Creating a Basic LocusZoom Plot**

```javascript
import React, { useEffect, useRef } from 'react';
import LocusZoom from 'locuszoom';

const LocusZoomPlot = () => {
  const plotRef = useRef(null);

  useEffect(() => {
    const dataSources = new LocusZoom.DataSources()
      .add('gene', ['GeneLZ', { url: 'YOUR_GENE_API_URL' }])
      .add('association', ['AssociationLZ', { url: 'YOUR_ASSOCIATION_API_URL' }])
      .add('ld', ['LDServer', { url: 'YOUR_LD_API_URL', variant: 'YOUR_VARIANT' }]);

    const layout = {
      state: { chr: 'YOUR_CHROMOSOME', start: YOUR_START, end: YOUR_END },
      panels: [
        LocusZoom.Layouts.get('panel', 'genes'),
        LocusZoom.Layouts.get('panel', 'association'),
      ],
    };

    LocusZoom.populate(plotRef.current, dataSources, layout);
  }, []);

  return <div ref={plotRef} style={{ width: '800px', height: '600px' }}></div>;
};

export default LocusZoomPlot;
```

**Customizing Panels with the `mods` Object**

The `mods` object allows you to customize panel behavior and appearance.

**Example: Customizing the Association Panel**

```javascript
const layout = {
  state: { chr: 'YOUR_CHROMOSOME', start: YOUR_START, end: YOUR_END },
  panels: [
    LocusZoom.Layouts.get('panel', 'genes'),
    LocusZoom.Layouts.get('panel', 'association', {
      id: 'myAssociationPanel',
      title: { text: 'Custom Association Plot' },
      namespace: { default: 'association', ld: 'ld' },
      y_index: 1,
      // ... other customizations ...
    }),
  ],
};
```

<!-- **This is mod**
```
const mod = {
      id: 'myAssociationPanel',
      title: { text: 'Custom Association Plot' },
      namespace: { default: 'association', ld: 'ld' },
      y_index: 1,
      // ... other customizations ...
    LocusZoom.Layouts.get("panel", "association", mods)
    }

``` -->

**Key `mods` Parameters:**

* **`id`:** A unique identifier for the panel.
* **`title`:** Configures the panel's title.
* **`namespace`:** Defines data source namespaces.
* **`y_index`:** Controls the panel's vertical stacking order.
* **`height`:** Sets the panel's height.
* **`data_layers`:** Customizes how data is visualized.

**Namespaces: Preventing Data Collisions**

* When using multiple data sources, namespaces prevent field name collisions.
* Use the `namespace` parameter in the `mods` object to specify the data source for each data type.

**Example: Using Namespaces**

```javascript
const layout = {
  // ...
  panels: [
    // ...
    LocusZoom.Layouts.get('panel', 'association', {
      namespace: { default: 'association', ld: 'ld' },
    }),
  ],
};
```

**Data Layers: Fine-Grained Visualization Control**

* Data layers define how data points are rendered within a panel.
* You can customize data layers to create complex visualizations.

**Example: Customizing Data Layers**

```javascript
const layout = {
  // ...
  panels: [
    // ...
    LocusZoom.Layouts.get('panel', 'association', {
      data_layers: [
        {
          type: 'scatter',
          fields: ['position', 'pvalue'],
          color: { field: 'r2', scale_function: 'r2_heatmap' },
          // ... other layer configurations ...
        },
      ],
    }),
  ],
};
```

**Toolbars: Interactive Controls**

* Toolbars provide controls for interacting with the LocusZoom plot.
* You can customize toolbars by adding, removing, or reordering widgets.

**Example: Customizing Toolbars**

```javascript
const layout = {
  // ...
  panels: [
    LocusZoom.Layouts.get('panel', 'genes', {
      toolbar: {
        widgets: [
          LocusZoom.Layouts.get('widget', 'region_scale'),
          // ... other widgets ...
        ],
      },
    }),
    // ...
  ],
};
```

**Troubleshooting Tips**

* **Data Source Errors:** Check your API URLs and ensure that the data sources are returning data.
* **Panel Rendering Issues:** Inspect the console for errors and verify that the required data sources are available.
* **Namespace Conflicts:** Use namespaces to prevent data field name collisions.
* **LD Dependencies:** Be aware of implicit LD dependencies in the `association` panel.

