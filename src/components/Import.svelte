<script lang="ts">
	import { dmarcString, spfString } from '../store';

	let fqdn = '';
	let inProgress = false;

	const enum DNSRecordType {
		A = 1,
		NS = 2,
		CNAME = 5,
		SOA = 6,
		MX = 15,
		TXT = 16,
		AAAA = 28,
		SRV = 33,
		DOA = 259
	}

	interface DOHResponse {
		/** The Response Code of the DNS internalQuery. These are defined here: https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#dns-parameters-6. */
		Status: number;

		/** If true, it means the truncated bit was set. This happens when the DNS answer is larger than a single UDP or TCP packet. TC will almost always be false with Cloudflare DNS over HTTPS because Cloudflare supports the maximum response size. */
		TC: boolean;
		/** If true, it means the Recursive Desired bit was set. This is always set to true for Cloudflare DNS over HTTPS. */
		RD: boolean;
		/** If true, it means the Recursion Available bit was set. This is always set to true for Cloudflare DNS over HTTPS. */
		RA: boolean;
		/** If true, it means that every record in the answer was verified with DNSSEC. */
		AD: boolean;
		/** If true, the client asked to disable DNSSEC validation. In this case, Cloudflare will still fetch the DNSSEC-related records, but it will not attempt to validate the records. */
		CD: boolean;

		Question: {
			/** The record name requested. */
			name: string;
			/** The type of DNS record requested. These are defined here: https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#dns-parameters-4. */
			type: DNSRecordType;
		}[];

		Answer?: {
			/** The record owner. */
			name: string;
			/** The type of DNS record. These are defined here: https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#dns-parameters-4. */
			type: DNSRecordType;
			/** The number of seconds the answer can be stored in cache before it is considered stale. */
			TTL: number;
			/** The value of the DNS record for the given name and type. The data will be in text for standardized record types and in hex for unknown types. */
			data: string;
		}[];

		/** List of EDE messages. Refer to [Extended DNS error codes](https://developers.cloudflare.com/1.1.1.1/infrastructure/extended-dns-error-codes/) for more */
		Comment?: string[];
	}

	interface DOHError {
		error: string;
	}

	const queryTXT = async (name: string) => {
		const fetchUrl = new URL('https://1.1.1.1/dns-query');
		fetchUrl.searchParams.set('name', name);
		fetchUrl.searchParams.set('type', 'TXT');

		const res = await fetch(fetchUrl, { headers: { accept: 'application/dns-json' } });
		const data = (await res.json()) as DOHResponse | DOHError;

		if ('error' in data) return null;
		if (!data.Answer) return null;

		return data.Answer.map((k) => k.data.substring(1, k.data.length - 1));
	};

	const doImport = async () => {
		inProgress = true;

		const spfTxts = await queryTXT(fqdn);
		const remoteSPF = spfTxts?.find((a) => a.startsWith('v=spf1'));
		$spfString = remoteSPF ?? '';

		const dmarcTxts = await queryTXT(`_dmarc.${fqdn}`);
		const remoteDMARC = dmarcTxts?.find((a) => a.startsWith('v=DMARC1'));
		$dmarcString = remoteDMARC ?? '';

		inProgress = false;
	};
</script>

<div class="flex flex-row gap-x-2">
	<input
		bind:value={fqdn}
		class="grow rounded-sm bg-neutral-50 px-3 py-2 font-mono text-sm transition-all focus:outline-none focus:ring focus:ring-pink-500/50 disabled:opacity-75 dark:bg-neutral-900"
		spellcheck="false"
		disabled={inProgress}
	/>
	<button
		class="rounded-sm bg-pink-500 px-3 py-2 text-sm font-medium text-white transition-all focus:outline-none focus:ring focus:ring-pink-500/50 disabled:opacity-75"
		on:click={doImport}
		disabled={inProgress}
	>
		Import
	</button>
</div>
