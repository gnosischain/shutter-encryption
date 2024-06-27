import { Accordion, AccordionItem, Image } from '@nextui-org/react';

export const FAQAccordion = () => {
  return (
    <div className="flex flex-col my-2 w-full md:w-[750px]">
      <h2 className="text-2xl text-center my-2">FAQ</h2>

      <Accordion selectionMode="multiple">
        <AccordionItem key="1" aria-label="what" title="What is the Opt-in Shutterized Gnosis Chain?">
          {`The Opt-in Shutterized Gnosis Chain is a proposal designed to enhance transaction 
          privacy and security on the Gnosis Chain. It allows users to encrypt transactions 
          to prevent frontrunning and censorship. Transactions are decrypted and executed 
          only when they are ready to be included in the blockchain, ensuring that potential 
          attackers cannot see transaction details ahead of time.`}
        </AccordionItem>

        <AccordionItem key="2" aria-label="what" title="Why should I use it?">
          {/* -- or -- What are the benefits of participating in this encrypted transaction system? */}
          {`Participating in this system protects your transactions from being visible to potential
           frontrunners and censors before being finalized in a block, enhancing your transaction's 
           privacy and security.`}
        </AccordionItem>

        <AccordionItem key="3" aria-label="how" title="How does it work?">
          {/* -- or -- How does the transaction encryption work? */}
          <div>
            {`When you send a transaction, instead of broadcasting it in plaintext, you encrypt 
            it using a public key known as the 'eon key'. This encrypted transaction is then 
            submitted to the blockchain, where it remains secure until it is time for 
            decryption and execution.`}
          </div>

          <ul className="list-disc list-inside my-2">
            <li><b>Users</b>: Users submit encrypted transactions to the network. They encrypt these transactions using a
              public key obtained from the Key Broadcast Contract.
            </li>
            <li><b>Key Broadcast Contract</b>: This contract distributes the encryption keys (public keys) to users and stores
              them for the Keypers to access as needed.
            </li>
            <li><b>Keypers</b>: Keypers are responsible for securely managing decryption keys. They generate decryption keys
              and provide these to the Sequencer Contract.
            </li>
            <li><b>Sequencer Contract</b>: This contract manages the queue of encrypted transactions submitted by users. It
              interacts with Keypers to obtain decryption keys and ensures that transactions are correctly ordered and
              ready for decryption.
            </li>
            <li><b>Proposer</b>: The Proposer (a type of validator) retrieves decrypted transactions from the Sequencer
              Contract, then includes them in a new block which is added to the blockchain.
            </li>
          </ul>

          <Image src="/shutter-architecture.png"/>
        </AccordionItem>

        <AccordionItem key="4" aria-label="what" title="What is a keyper?">
          {`Keypers are special nodes responsible for managing encryption keys and decrypting 
          transactions. They play a crucial role in maintaining the security and integrity of 
          encrypted transactions on the chain.`}
        </AccordionItem>

        <AccordionItem key="5" aria-label="what" title="Who can become a keyper?">
          {`Validators of the Gnosis Chain can opt to become keypers. They need to register 
          through a smart contract and participate in key generation and transaction decryption processes.`}
        </AccordionItem>

        <AccordionItem key="6" aria-label="what" title="How is transaction decryption handled?">
          {`A group of keypers generates decryption keys for transactions queued for a particular block. 
          The transaction decryption process starts only when enough keypers (as defined by a set threshold) 
          have provided parts of the decryption key, ensuring that no single keyper can decrypt transactions 
          on their own.`}
        </AccordionItem>

        <AccordionItem key="7" aria-label="what" title="What if a keyper is offline?">
          {`If a keyper goes offline, they can catch up by observing the network for decryption keys generated 
          by other keypers. This mechanism ensures that the decryption process can continue smoothly even 
          if some keypers are temporarily unavailable.`}
        </AccordionItem>

        <AccordionItem key="8" aria-label="what" title="What happens to my transaction if it can't be decrypted?">
          {`If a transaction cannot be decrypted (e.g., due to corrupted data or a mismatch in the encryption), it 
          won't be included in the encrypted section of the block. However, it may still be included later in the 
          plaintext section if it's valid, although this could potentially expose it to frontrunning.`}
        </AccordionItem>

        <AccordionItem key="9" aria-label="what" title="Can I opt-out of using this encryption service?">
          {`Yes, using the encrypted transaction service is entirely opt-in. You can choose to send transactions 
          in the usual plaintext format if you prefer not to use encryption.`}
        </AccordionItem>

        <AccordionItem key="10" aria-label="what" title="Are there any risks?">
          {`While the system is designed to be secure, it relies on the assumption that a majority of the 
          keypers are honest and online. Malicious behavior or a significant number of keypers going 
          offline could potentially compromise transaction security.`}
        </AccordionItem>

        <AccordionItem key="11" aria-label="what" title="How do I start using encrypted transactions on the Opt-in Shutterized Gnosis Chain?">
          {`To use encrypted transactions, you'll need to use this app and a compatible wallet that supports 
          signing transaction without broadcasting it (such as Brave Wallet).`}
        </AccordionItem>
      </Accordion>
    </div>
  )
};
