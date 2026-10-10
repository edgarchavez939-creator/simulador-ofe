window.ProgramCatalogValidator = {
  validate(program) {
    const errors = [];
    if (!program || typeof program !== "object") return ["Programa inválido"];
    for (const field of window.ProgramCatalogSchema.required) {
      if (program[field] === undefined || program[field] === null || program[field] === "") {
        errors.push(`Falta ${field}`);
      }
    }
    if (program.nivel && !window.ProgramCatalogSchema.levels.includes(program.nivel)) {
      errors.push("Nivel inválido");
    }
    if (program.valorMatricula !== undefined && Number(program.valorMatricula) < 0) {
      errors.push("valorMatricula no puede ser negativo");
    }
    return errors;
  }
};
