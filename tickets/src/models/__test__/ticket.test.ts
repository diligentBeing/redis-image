import { Ticket } from "../Ticket";

it("Implements optimistic concurrency control OCC", async (done) => {
  //Create an instance of a ticket
  const ticket = new Ticket({ title: "tixy", price: 20, userId: "adfadf" });

  // Save the ticket to the database
  await ticket.save();

  //fetch the ticket twice
  const first = await Ticket.findById(ticket.id);
  const second = await Ticket.findById(ticket.id);

  //make separate changes to the tickets we fetched
  first?.set({ price: 25 });
  second?.set({ price: 25 });

  //save the first
  await first?.save();

  //save the second, expect an error
  try {
    await second?.save();
  } catch (err) {
    return done();
  }
  throw new Error("Should not reach this point");
});

it("increments version number", async () => {
  //Create an instance of a ticket
  const ticket = new Ticket({ title: "tixy", price: 20, userId: "adfadf" });

  // Save the ticket to the database
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
  await ticket.save();
  expect(ticket.version).toEqual(3);
});
