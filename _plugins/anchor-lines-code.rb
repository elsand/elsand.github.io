PREFIX = '<pre class="lineno">'
POSTFIX = '</pre>'

Jekyll::Hooks.register([:pages, :posts], :post_render) do |doc|

  if doc.output_ext == ".html"
    code_block_counter = 1
    
    doc.output = doc.output.gsub(/<pre class="lineno">[\n0-9]+<\/pre>/) do |match|
      line_numbers = match
                      .gsub(/<pre class="lineno">([\n0-9]+)<\/pre>/, '\1')
                      .split("\n")

      anchored_line_numbers_array = line_numbers.map do |n|
        id = "B#{code_block_counter}-L#{n}"
        "<a id=\"#{id}\" href=\"##{id}\">#{n}</a>"
      end
      code_block_counter += 1
      PREFIX + anchored_line_numbers_array.join("\n") + POSTFIX
    end
  end
end