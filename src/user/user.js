
/**
 * User model
 */
export class User {
	constructor(firstName, lastName, userName) {
		this.firstName = firstName;
		this.lastName = lastName;
		this.userName = userName;
  }

  /**
   * get Full name
   * @return {string} Full name.
   */
	get fullName() {
		return this.firstName + ' ' + this.lastName;
	}
}
