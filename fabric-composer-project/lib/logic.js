async function uploadInfo(creation){
    let assetRegistry = await 
    getAssetRegistry(org.example.cjibnetwork.PersonInfo);
    await assetRegistry.update(creation.personinfo);
}