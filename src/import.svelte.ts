import { store } from './store.svelte';

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
		type: number;
	}[];

	Answer?: {
		/** The record owner. */
		name: string;
		/** The type of DNS record. These are defined here: https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#dns-parameters-4. */
		type: number;
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
	const fetchUrl = new URL('https://cloudflare-dns.com/dns-query');
	fetchUrl.searchParams.set('name', name);
	fetchUrl.searchParams.set('type', 'TXT');

	const res = await fetch(fetchUrl, { headers: { accept: 'application/dns-json' } });
	const data = (await res.json()) as DOHResponse | DOHError;

	if ('error' in data) return null;
	if (!data.Answer) return null;

	return data.Answer.map((k) => k.data.slice(1, -1));
};

const importSPF = async () => {
	if (!store.import_) return;

	const spfTxts = await queryTXT(store.import_);
	const remoteSPF = spfTxts?.find((a) => a.includes('v=spf1'));
	store.spf = remoteSPF ?? '';
};

const importDMARC = async () => {
	if (!store.import_) return;

	const dmarcTxts = await queryTXT(`_dmarc.${store.import_}`);
	const remoteDMARC = dmarcTxts?.find((a) => a.includes('v=DMARC1'));
	store.dmarc = remoteDMARC ?? '';
};

export const import_ = async () => {
	try {
		await Promise.all([importDMARC(), importSPF()]);
	} catch (error) {
		globalThis.alert(error);
	}
};
