import {Asset} from './org.hyperledger.composer.system';
import {Participant} from './org.hyperledger.composer.system';
import {Transaction} from './org.hyperledger.composer.system';
import {Event} from './org.hyperledger.composer.system';
// export namespace org.example.cjibnetwork{
   export class PersonInfo extends Asset {
      BSN: string;
      firstName: string;
      lastName: string;
      address: string;
      salary: number;
      owner: Municipality;
   }
   export class Municipality extends Participant {
      munId: string;
   }
   export class Client extends Participant {
      clientId: string;
   }
   export class createPersonInfo extends Transaction {
      personinfo: PersonInfo;
   }
// }
