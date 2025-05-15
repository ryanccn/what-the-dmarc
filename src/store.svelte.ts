let importString = $state('');
let dmarcString = $state('');
let spfString = $state('');

export const store = {
	get import_() {
		return importString;
	},
	set import_(v: string) {
		importString = v;
	},
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
