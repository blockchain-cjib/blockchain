/**
 * Trans
 * @param {org.example.cjibnetwork.createPersonInfo} transaction instance
 * @transaction
 */
async function createPersonInfo(tx){
    if (tx.personinfo.consent) {
        let assetRegistry = await getAssetRegistry('org.example.cjibnetwork.PersonInfo');
        await assetRegistry.add(tx.personinfo);
    }
}

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