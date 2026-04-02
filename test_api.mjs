async function test() {
    try {
        const res = await fetch('http://localhost:3000/api/creator/crm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: "Teste Admin",
                email: "teste@admin.com",
                empresa: "Empresa Teste",
                cargo: "CEO",
                canal_origem: "Site",
                status_funil: "lead",
                tags: ["Teste"],
                notas: "Nota de teste"
            })
        })
        console.log('Status:', res.status)
        const json = await res.json()
        console.log('JSON:', json)
    } catch (e) {
        console.error('Error:', e)
    }
}
test()
