async function uploadInfo(creation){
    let assetRegistry = await 
    getAssetRegistry(org.example.cjibnetwork.PersonInfo);
    await assetRegistry.update(creation.personinfo);
}

async function cjibGetPersonInfo(tx) {

    let citizen = await query('getCitizen', {bsnParam: tx.bsn})[0];

    let citizenSalary = citizen.salary;

    return citizenSalary > tx.fine;
}