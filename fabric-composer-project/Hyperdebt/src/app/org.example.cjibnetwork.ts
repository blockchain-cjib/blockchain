import {Asset} from './org.hyperledger.composer.system';
import {Participant} from './org.hyperledger.composer.system';
import {Transaction} from './org.hyperledger.composer.system';
import {Event} from './org.hyperledger.composer.system';
// export namespace org.example.cjibnetwork{
   export class PersonInfo extends Asset {
      bsn: string;
      firstName: string;
      lastName: string;
      address: string;
      salary: number;
      owner: Municipality;
   }
   export class Municipality extends Participant {
      munId: string;
   }
   export class createPersonInfo extends Transaction {
      personinfo: PersonInfo;
   }
   export class cjibGetPersonInfo extends Transaction {
      fineAmount: number;
      bsn: string;
   }
// }
