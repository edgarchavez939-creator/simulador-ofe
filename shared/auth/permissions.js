(function initOFEPermissions(global){
  'use strict';
  const permissions = new Set();
  const supported = ['simulator.use', 'programs.view', 'programs.update', 'audit.view'];
  async function refresh() {
    permissions.clear();
    try {
      if (await global.OFEAuth.isAuthenticated()) {
        for (const permission of supported) if (await global.OFEAuth.can(permission)) permissions.add(permission);
      }
    } catch (_) {
      permissions.clear();
      // Sin proveedor institucional configurado, la administración permanece cerrada.
    }
    document.querySelectorAll('[data-requires-permission]').forEach(element => {
      element.hidden = !permissions.has(element.dataset.requiresPermission);
    });
  }
  function allowed(permission) { return permissions.has(permission); }
  global.OFEPermissions = Object.freeze({ refresh, allowed });
})(window);
