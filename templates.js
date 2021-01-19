module.exports = {
    container_start: e =>
        `Started <b>${e.Actor.Attributes.name} (${e.Actor.Attributes.image})</b>`,

    container_die: e =>
        `Stopped <b>${e.Actor.Attributes.name} (${e.Actor.Attributes.image})</b>\nExit Code: <b>${e.Actor.Attributes.exitCode}</b>`,

    'container_health_status: healthy': e =>
        `Status <b>Healthy</b> for <b>${e.Actor.Attributes.name} (${e.Actor.Attributes.image})</b>`,

    'container_health_status: unhealthy': e =>
        `Status <b>Unhealthy</b> for <b>${e.Actor.Attributes.name} (${e.Actor.Attributes.image})</b>`,
};
