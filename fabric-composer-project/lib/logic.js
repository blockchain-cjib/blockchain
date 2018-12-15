// async function uploadInfo(creation){
//     let assetRegistry = await
//     getAssetRegistry(org.example.cjibnetwork.PersonInfo);
//     await assetRegistry.update(creation.personinfo);
// }

/**
 * Trans
 * @param {org.example.cjibnetwork.cjibGetPersonInfo} transaction instance
 * @transaction
 */
async function cjibGetPersonInfo(tx) {

    let citizen = await query('getCitizen', {bsnParam: tx.bsn});

    let citizenSalary = citizen[0].salary;

    if (citizenSalary > tx.fineAmount) {
        return "True";
    }
    return "False";
}