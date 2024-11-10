// snuggleboard.js

async function loadEntries() {
    try {
        const response = await fetch('/api/getall');
        const entries = await response.json();

        const container = document.getElementById('entries-container');
        container.innerHTML = `
             <table class="table table-striped table-hover table-dark">
                <thead class="thead-dark">
                    <tr>
                        <th scope="col">Name</th>
                        <th scope="col">Color</th>
                        <th scope="col">Breed</th>
                    </tr>
                </thead>
                <tbody id="table-body">

                </tbody>
            </table>
        `;

        const tableBody = document.getElementById('table-body');
        entries.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.username || entry.name}</td>
                <td>${entry.color || 'N/A'}</td>
                <td>${entry.breed || 'N/A'}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading entries:', error);
    }
}

// Load entries when the page loads
window.onload = loadEntries;
