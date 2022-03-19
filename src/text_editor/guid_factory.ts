export default class GuidFactory {
  createPart() {
    return Math.floor(Math.random() * 0x10000 /* 65536 */).toString(16);
  }

  create() {
    return (
      this.createPart() +
      this.createPart() +
      '-' +
      this.createPart() +
      '-' +
      this.createPart() +
      '-' +
      this.createPart() +
      '-' +
      this.createPart() +
      this.createPart() +
      this.createPart()
    );
  }

  static create() {
    return new GuidFactory().create();
  }
}
