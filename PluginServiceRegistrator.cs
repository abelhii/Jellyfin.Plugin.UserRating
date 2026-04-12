using Microsoft.Extensions.DependencyInjection;
using MediaBrowser.Common.Plugins;

public class PluginServiceRegistrator : IPluginServiceRegistrator
{
    public void RegisterServices(IServiceCollection serviceCollection)
    {
        serviceCollection.AddHostedService<StartupService>();
    }
}