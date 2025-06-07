function crearSelectorProducto(index) {
    const contenedor = document.createElement('div');
    contenedor.classList.add('row', 'mb-2');
  
    contenedor.innerHTML = `
      <div class="col-md-6">
        <select name="productos[${index}][id]" class="form-control producto-select" required>
          <option value="">Seleccione un producto</option>
          ${window.productos.map(p => `<option value="${p._id}" data-precio="${p.precio}">${p.nombre} - $${p.precio}</option>`).join('')}
        </select>
      </div>
      <div class="col-md-3">
        <input type="number" name="productos[${index}][cantidad]" class="form-control cantidad-input" min="1" value="1" required>
      </div>
      <div class="col-md-3">
        <button type="button" class="btn btn-danger btn-sm eliminar-producto">Eliminar</button>
      </div>
    `;
  
    return contenedor;
  }
  
  document.addEventListener('DOMContentLoaded', function () {
    const contenedor = document.getElementById('productos-container');
    const btnAgregar = document.getElementById('agregar-producto');
    const inputTotal = document.getElementById('total');
    let index = 0;
  
    function recalcularTotal() {
      let total = 0;
      document.querySelectorAll('.producto-select').forEach((select, i) => {
        const selected = select.options[select.selectedIndex];
        const precio = parseFloat(selected.getAttribute('data-precio')) || 0;
        const cantidad = parseFloat(document.querySelectorAll('.cantidad-input')[i].value) || 1;
        total += precio * cantidad;
      });
      inputTotal.value = total.toFixed(2);
    }
  
    btnAgregar.addEventListener('click', () => {
      const selector = crearSelectorProducto(index++);
      contenedor.appendChild(selector);
      recalcularTotal();
  
      selector.querySelector('.producto-select').addEventListener('change', recalcularTotal);
      selector.querySelector('.cantidad-input').addEventListener('input', recalcularTotal);
      selector.querySelector('.eliminar-producto').addEventListener('click', () => {
        selector.remove();
        recalcularTotal();
      });
    });
  
    // Agrega un selector por defecto
    btnAgregar.click();
  });
  