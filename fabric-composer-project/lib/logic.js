

/**
 * Trans
 * @param {org.example.cjibnetwork.createPersonInfo} transaction instance
 * @transaction
 */
async function createPersonInfo(tx){
    if (tx.personinfo.consent) {
        let assetRegistry = await getAssetRegistry('org.example.cjibnetwork.PersonInfo');
        await assetRegistry.add(tx.personinfo);
    } else {
        throw new Error('Citizen consent was not provided');
    }
}

/**
 * Trans
 * @param {org.example.cjibnetwork.cjibGetPersonInfo} transaction instance
 * @transaction
 */
async function cjibGetPersonInfo(tx) {
    const factory = getFactory();
    const response = factory.newConcept('org.example.cjibnetwork', 'Response');
    response.answer = 'null';
    
    let citizen = await query('getCitizen', {bsnParam: tx.bsn});
    if (citizen.length !== 0) {
        let citizenSalary = citizen[0].salary;
        response.answer = canPay(citizenSalary, tx.fineAmount, tx.months);
        return response;
    }
    return response;
}

/**
 * Checks whether the citizen is able to pay the provided fineAmount or not
 * @param {*} citizenSalary the salary of the citizen
 * @param {*} fineAmount the amount to be paid
 * @param {*} months used to check if he will be able to pay in the next months
 */
function canPay(citizenSalary, fineAmount, months) {
    if(months === undefined) {
        return (citizenSalary >= fineAmount) ?  'true' : 'false';
    } else {
        return (citizenSalary * months >= fineAmount) ? 'true' : 'false';
    }
}
