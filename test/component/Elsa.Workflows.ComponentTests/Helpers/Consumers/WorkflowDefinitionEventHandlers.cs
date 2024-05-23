using Elsa.MassTransit.Messages;
using Hangfire.Annotations;
using MassTransit;

namespace Elsa.Workflows.ComponentTests.Consumers;

[UsedImplicitly]
public class WorkflowDefinitionEventHandlers(IWorkflowDefinitionEvents workflowDefinitionEvents) : IConsumer<WorkflowDefinitionDeleted>
{
    public Task Consume(ConsumeContext<WorkflowDefinitionDeleted> context)
    {
        workflowDefinitionEvents.OnWorkflowDefinitionDeleted(new WorkflowDefinitionDeletedEventArgs(context.Message.Id));
        return Task.CompletedTask;
    }
}