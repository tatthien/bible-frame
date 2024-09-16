import { parseAddress } from "./parseAddress";

describe('parseAddress', () => {
  it('should parse address', () => {
    const inputs = [
      {
        address: 'Gen 1:1',
        expected: {
          book: 'GEN',
          chapter: '1',
          verses: [1],
        },
      },
      {
        address: 'Gen 1',
        expected: {
          book: 'GEN',
          chapter: '1',
          verses: [],
        },
      },
      {
        address: 'Gen 1:1-5',
        expected: {
          book: 'GEN',
          chapter: '1',
          verses: [1, 2, 3, 4, 5],
        },
      }
    ]

    for (const input of inputs) {
      expect(parseAddress(input.address)).toEqual(input.expected)
    }
  })
})
