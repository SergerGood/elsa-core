import 'reflect-metadata';
import {Container, Service} from "typedi";
import {PortProvider, PortProviderContext} from "../../components/activities/flowchart/port-provider";
import {Activity, ActivityPropertyChangedEventArgs, EventTypes, Port} from "../../models";
import {SwitchActivity} from "./models";
import {EventBus} from "../../services";
import {SwitchPlugin} from "./switch-plugin";

@Service()
export class SwitchPortUpdater {

  constructor() {
    const eventBus = Container.get(EventBus);

    eventBus.on(EventTypes.Activity.PropertyChanged, this.onActivityPropertyChanged);
  }

  private onActivityPropertyChanged = async (e: ActivityPropertyChangedEventArgs) => {

    const activity = e.activity;
    const propertyName = e.propertyName;

    if (activity.nodeType !== SwitchPlugin.ActivityTypeName || propertyName !== 'cases')
      return;

    const switchActivity = activity as SwitchActivity;
    const cases = switchActivity.cases;

    const workflowEditor = e.workflowEditor;
    const canvas = await workflowEditor.getCanvas();
    const flowChart = (await canvas.getRootComponent()) as HTMLElsaFlowchartElement;
    const graph = await flowChart.getGraph();

    const node = graph.getNodes().find(x => x.data.id === activity.id);

    if (!node)
      return;

    // Remove ports.
    const ports = [...node.getPortsByGroup('out')];
    for (const port of ports) {
      if (cases.find(x => x.label == port.id) == null)
        node.removePort(port);
    }

    // Add new ports.
    for (const c of cases) {
      if (!node.hasPort(c.label))
        node.addPort({
          id: c.label, group: 'out', attrs: {
            text: {
              text: c.label
            }
          }
        })
    }
  }
}