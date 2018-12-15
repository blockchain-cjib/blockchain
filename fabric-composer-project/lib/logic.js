async function uploadInfo(creation){
    let assetRegistry = await
    getAssetRegistry(org.example.cjibnetwork.PersonInfo);
    await assetRegistry.update(creation.personinfo);
}

/**
 * Trans
 * @param {org.example.cjibnetwork.cjibGetPersonInfo} transaction instance
 * @transaction
 */
async function cjibGetPersonInfo(tx) {

    let citizen = await query('getCitizen', {bsnParam: tx.bsn});

    let citizenSalary = citizen[0].salary;

    return canPay(citizenSalary, tx.fineAmount, tx.months);

}

function canPay(citizenSalary, fineAmount, months){
    if(months == undefined){
        if(citizenSalary >= fineAmount){
            return "True";
        }
        return "False";
    }else{
        if(citizenSalary*months >= fineAmount){
            return "True";
        }
        return "False";
    }
}