// script para editar cliente
function abrirModalEditar(cliente) {
  document.getElementById('clienteIdEditar').value = cliente._id;
  document.getElementById('nombreEditar').value = cliente.nombre;
  document.getElementById('emailEditar').value = cliente.email;
  document.getElementById('telefonoEditar').value = cliente.telefono;
  document.getElementById('direccionEditar').value = cliente.direccion;
  document.getElementById('activoEditar').value = cliente.activo;

  document.getElementById('formEditarCliente').action = `/clientes/editar/${cliente._id}`;
  const modal = new bootstrap.Modal(document.getElementById('modalEditarCliente'));
  modal.show();
};