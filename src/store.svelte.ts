let dmarcString = $state('');
let spfString = $state('');

export const store = {
	get dmarc() {
		return dmarcString;
	},
	set dmarc(v: string) {
		dmarcString = v;
	},
	get spf() {
		return spfString;
	},
	set spf(v: string) {
		spfString = v;
	}
};
