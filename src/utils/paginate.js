const paginate = (data, page, perPage, basePath) => {
  const currentPage = parseInt(page) || 1;
  const total = data.length;
  const lastPage = Math.ceil(total / perPage);
  const from = total > 0 ? (currentPage - 1) * perPage + 1 : null;
  const to = total > 0 ? Math.min(currentPage * perPage, total) : null;

  const items = data.slice((currentPage - 1) * perPage, currentPage * perPage);

  const links = [];
  links.push({
    url: currentPage > 1 ? `${basePath}?page=${currentPage - 1}` : null,
    label: '&laquo; Previous',
    page: currentPage > 1 ? currentPage - 1 : null,
    active: false,
  });

  for (let i = 1; i <= lastPage; i++) {
    links.push({
      url: `${basePath}?page=${i}`,
      label: `${i}`,
      page: i,
      active: i === currentPage,
    });
  }

  links.push({
    url: currentPage < lastPage ? `${basePath}?page=${currentPage + 1}` : null,
    label: 'Next &raquo;',
    page: currentPage < lastPage ? currentPage + 1 : null,
    active: false,
  });

  return {
    current_page: currentPage,
    data: items,
    first_page_url: `${basePath}?page=1`,
    from,
    last_page: lastPage,
    last_page_url: `${basePath}?page=${lastPage}`,
    links,
    next_page_url: currentPage < lastPage ? `${basePath}?page=${currentPage + 1}` : null,
    path: basePath,
    per_page: perPage,
    prev_page_url: currentPage > 1 ? `${basePath}?page=${currentPage - 1}` : null,
    to,
    total,
  };
};

module.exports = { paginate };