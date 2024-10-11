import { expect, test } from "vitest";
import { createMemoryClient } from "tevm";

import { rmSync } from "node:fs";
import { fsPrecompile } from "./fsPrecompile.js";
import { join } from "node:path";

// To get rid of the red underline for this import you must use the local typescript version
// https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-the-workspace-version-of-typescript
// > Typescript: Select Typescript version: Use Workspace Version
import { WriteHelloWorld } from "../contracts/WriteHelloWorld.s.sol";
import { createStorePrecompile } from "./createCustomPrecompile.js";

test("Call precompile from solidity script", async () => {
	const filePath = join(__dirname, "test.txt");
	const message = "Hello, World!";
	const client = createMemoryClient({
		/**
		 * THis precompile allows our solidity script to use `fs.writeFile` to write to the filesystem
		 */
		customPrecompiles: [createStorePrecompile({
			address: "0x5cfe08587E1fbDc2C0e8e50ba4B5f591F45B1849"
		}).precompile()],
	});

	expect(
		/**
		 * `tevmScript` runs arbitrary solidity scripts on the memory client
		 */
		await client.tevmContract({
			deployedBytecode: WriteHelloWorld.deployedBytecode,
			/**
			 * Tevm scripts when imported with the tevm compiler provide a stramlined dev experience where contract building happens directly via a
			 * javascript import.
			 */
			...WriteHelloWorld.write.hello(
				fsPrecompile.contract.address,
				filePath,
				message,
			),
			throwOnFail: false,
		}),
	).toMatchInlineSnapshot(`
  {
    "amountSpent": 176197n,
    "createdAddresses": Set {},
    "data": undefined,
    "executionGasUsed": 2123n,
    "gas": 29974829n,
    "logs": [],
    "rawData": "0x",
    "selfdestruct": Set {},
    "totalGasSpent": 25171n,
  }
`);

	// test the solidity script wrote to the filesystem
	expect(
		await client.tevmContract({
			/**
			 * Tevm scripts when imported with the tevm compiler provide a stramlined dev experience where contract building happens directly via a
			 * javascript import.
			 */
			...fsPrecompile.contract.read.readFile(filePath),
			throwOnFail: false,
		}),
	).toMatchInlineSnapshot(`
  {
    "amountSpent": 154812n,
    "data": "Hello, World!",
    "executionGasUsed": 0n,
    "rawData": "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000d48656c6c6f2c20576f726c642100000000000000000000000000000000000000",
    "totalGasSpent": 22116n,
  }
`);

	rmSync(filePath);
});
