async function test() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ecosphere.com', password: 'password123' })
    });
    const { token } = await loginRes.json();

    // Create a vendor
    const newVendorRes = await fetch('http://localhost:5000/api/vendors', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        name: 'Logistics Partner ' + Date.now(),
        category: 'logistics',
        sustainabilityRating: 90
      })
    });
    const vendor = await newVendorRes.json();
    console.log('Created vendor:', vendor.name, 'with ID:', vendor._id);

    // Get an emission factor
    const factorsRes = await fetch('http://localhost:5000/api/emission-factors', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const factors = await factorsRes.json();
    const factorId = factors[0]._id;

    // Get a department
    const deptsRes = await fetch('http://localhost:5000/api/departments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const depts = await deptsRes.json();
    const deptId = depts[0]._id;

    // Create Scope 3 transaction
    const txRes = await fetch('http://localhost:5000/api/carbon-transactions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
        name: 'Supplier Delivery ' + Date.now(),
        department: deptId,
        emissionFactor: factorId,
        quantity: 500,
        date: new Date().toISOString(),
        source: 'manual',
        scope: 'scope_3',
        scope3Category: 'upstream_transportation',
        vendor: vendor._id
      })
    });
    const tx = await txRes.json();
    console.log('Created Scope 3 tx:', tx.name, 'Scope:', tx.scope);

    // Verify GET /carbon-transactions populates vendor
    const allTxRes = await fetch('http://localhost:5000/api/carbon-transactions', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const allTx = await allTxRes.json();
    const createdTx = allTx.find(t => t._id === tx._id);
    console.log('Populated vendor in GET:', createdTx.vendor);

  } catch (error) {
    console.error('Error:', error);
  }
}
test();
