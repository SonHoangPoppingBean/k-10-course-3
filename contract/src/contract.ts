// Find all our documentation at https://docs.near.org
import { NearBindgen, 
  near, 
  call, 
  view, 
  initialize, 
  LookupMap,
  assert
 } from 'near-sdk-js';
import {AccountId} from "near-sdk-js/lib/types";

class Token {
  token_id: number;
  owner_id: AccountId;
  name: string;
  description: string;
  media_uri: string;
  level: number;

  constructor(token_id: number, owner_id: AccountId, name: string, description: string, media_uri: string, level: number) {
    this.token_id = token_id;
    this.owner_id = owner_id;
    this.name = name;
    this.description = description;
    this.media_uri = media_uri;
    this.level = level;
  }
}

@NearBindgen({})
class Contract {
  token_id: number;
  owner_id: AccountId;
  owner_by_id: LookupMap<any>; // 1 address multiple tokens
  token_by_id: LookupMap<any>; // 1 address 1 token
  approval_by_id: LookupMap<any>;
  constructor() {
    this.token_id = 0;
    this.owner_id = "";
    this.owner_by_id = new LookupMap("o");
    this.token_by_id = new LookupMap("t");
    this.approval_by_id = new LookupMap("a");
  }

  @initialize({})
  init({ owner_id, prefix } : { owner_id: AccountId; prefix: string }): void{
    this.owner_id = owner_id;
    this.token_id = 0;
    this.owner_by_id = new LookupMap(prefix);
    this.token_by_id = new LookupMap("t");
    this.approval_by_id = new LookupMap("a");
  }

  @call({}) //token_id = 0
  mint_nft({token_owner_id, name, description, media_uri, level}) {
    this.owner_by_id.set(this.token_id.toString(), token_owner_id);
    let token = new Token(this.token_id, token_owner_id, name, description, media_uri, level);

    this.token_by_id.set(this.token_id.toString(), token);
                        // 0                       // token
    this.token_id++;
    return token;
  }

  // @call({})
  // approve_account({token_id, account_id} : {token_id: number, account_id: AccountId}) : boolean {
  //   if (this.approval_by_id === null) {
  //     throw new Error("NFT does not support Approval Managements");
  //   }
  //   if (this.approval_by_id.containsKey(account_id)){
  //     throw new Error("This account has been approved");
  //   }
  //   assert(
  //     near.predecessorAccountId() === this.owner_id,
  //     "Only supports the one non-fungible token contract"
  //   );
  //   let token = this.token_by_id.get(token_id.toString());
  //   if(token === null){
  //     throw new Error("NFT does not exists");
  //   }
  //   this.approval_by_id.set(token_id.toString(), account_id);
  //   return true;
  // }

  @view({})
  get_token_by_id({token_id} : {token_id: number}) {
    let token = this.token_by_id.get(token_id.toString());
    if (token === null){
      return null;
    }
    return token;
  }
  @view({})
  get_supply_tokens(){
    return this.token_id;
  }
  @view({})
  get_all_tokens(){
    var all_tokens = [];
    
    for(var i = 0; i< this.token_id; i++){
      all_tokens.push(this.token_by_id.get(i.toString()));
    }
    return all_tokens;
  }
//#region HOMEWORK-BUOI3
//#region NEP-181 standard
  @view({})
  nft_total_supply(): string {
    return this.token_id.toString();
  }

  @view({})
  nft_tokens({from_index, limit} : {
    from_index: string|null,
    limit: number|null 
  }
  ): Token[] {
    if(from_index === "" || from_index === null ) 
    { 
      from_index = "0";
    }
    if(isNaN(parseInt(from_index)) === true)
    { 
      throw new Error("Invalid from_index number"); 
    }
    if(limit < 0 || limit === null)
    { 
      throw new Error("Invalid limit number!"); 
    }

    var tokens = [];
    let n_from_index = parseInt(from_index);
    console.log(n_from_index);
    
    let n_to_index =  + (limit - 1);
    if(n_to_index > this.token_id) n_to_index = this.token_id;

    console.log(n_from_index);
    for(var i = n_from_index; i < n_to_index; i++) {
      tokens.push(this.token_by_id.get(i.toString()));
    }
    return tokens;
  }

  @view({})
  nft_supply_for_owner( {account_id} : {
    account_id: string
  }
  ): string {
    var tokens = [];
    for(var i = 0; i < this.token_id; i++){
      let n_owner_id = this.owner_by_id.get(i.toString());
      if(n_owner_id.toString() === account_id){
        tokens.push(this.owner_by_id.get(i.toString()));
      }
    }
    return tokens.length.toString();
  }

  @view({})
  nft_tokens_for_owner( {account_id, from_index, limit} : {
    account_id: string,
    from_index: string|null,
    limit: number|null,
  }
  ): Token[] {
    //Validate parameters
    if(from_index === "" || from_index === null ) from_index = "0";
    if(isNaN(parseInt(from_index)) === true) {throw new Error("Invalid from_index number");}
    if(limit < 0 || limit === null) {throw new Error("Invalid limit number!");}
    
    var tokens = [];
    var tokens_for_owner = [];

    //Get tokens by owner_id;
    for(var i = 0; i < this.token_id; i++){
      let n_owner_id = this.owner_by_id.get(i.toString());
      if(n_owner_id.toString() === account_id){
        tokens.push(this.owner_by_id.get(i.toString()));
      }
    }
    var number_of_tokens_by_owner = tokens.length;
    //Get tokens by indexes;
    var n_from_index = parseInt(from_index);
    var n_to_index =  + (limit - 1);
    if(n_to_index > number_of_tokens_by_owner) n_to_index == this.token_id;
    for(var i = n_from_index; i< n_to_index; i++){
      tokens_for_owner.push(tokens[i]);
    }
    return tokens_for_owner;
    
  }
//#endregion
//#endregion
}
