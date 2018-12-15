

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